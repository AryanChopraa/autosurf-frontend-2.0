import WebSocket, { WebSocketServer } from 'ws';
import { createClient } from '@supabase/supabase-js';
import { config } from '../config/index';
import { AIBrowserAgent } from '../real-browsing-agent/open-ai-agent';
import { Server } from 'http';
import { 
    AgentRunStatus, 
    WebSocketMessage, 
    AuthenticatedWebSocket, 
    Step, 
    AgentRunSteps, 
    AgentRun,
    ScriptCommand,
    ExtendedAIBrowserAgent 
} from '../types';

// Create the base Supabase client for authentication only
const supabaseAuth = createClient(config.supabaseUrl!, config.supabaseKey!);

const SCREENSHOT_UPDATE_INTERVAL = 1000; // 1 second

export class AgentWebSocketServer {
    private wss: WebSocketServer;
    private activeAgents: Map<string, ExtendedAIBrowserAgent> = new Map();
    private heartbeatInterval: NodeJS.Timeout;
    private screenshotIntervals: Map<string, NodeJS.Timeout> = new Map();

    constructor(server: Server) {
        console.log('Initializing AgentWebSocketServer...');
        this.wss = new WebSocketServer({ server });
        this.setupWebSocketServer();
        this.heartbeatInterval = this.setupHeartbeat();
        console.log('AgentWebSocketServer initialized successfully');
    }

    private setupHeartbeat() {
        return setInterval(() => this.checkClientHeartbeats(), 30000);
    }

    private checkClientHeartbeats() {
        this.wss.clients.forEach((ws) => {
            const client = ws as unknown as AuthenticatedWebSocket;
            if ('isAlive' in client && !client.isAlive) {
                console.log('Client failed heartbeat check, terminating connection');
                return client.terminate();
            }
            if ('isAlive' in client) {
                client.isAlive = false;
                client.ping();
            }
        });
    }

    private async authenticateUser(token: string): Promise<string | null> {
        try {
            const { data: { user }, error } = await supabaseAuth.auth.getUser(token);
            if (error || !user) {
                console.error('Authentication failed:', error?.message || 'No user found');
                return null;
            }
            return user.id;
        } catch (error) {
            console.error('Authentication error:', error);
            return null;
        }
    }

    private async startPeriodicScreenshotUpdates(ws: AuthenticatedWebSocket, runId: string, agent: ExtendedAIBrowserAgent) {
        const interval = setInterval(async () => {
            try {
                const screenshot = await agent.captureScreenshot();
                if (screenshot) {
                    ws.send(JSON.stringify({
                        type: 'screenshot_update',
                        screenshot,
                        runId
                    }));
                }
            } catch (error) {
                console.error('Error capturing periodic screenshot:', error);
            }
        }, SCREENSHOT_UPDATE_INTERVAL);

        this.screenshotIntervals.set(runId, interval);
    }

    private stopPeriodicScreenshotUpdates(runId: string) {
        const interval = this.screenshotIntervals.get(runId);
        if (interval) {
            clearInterval(interval);
            this.screenshotIntervals.delete(runId);
        }
    }

    private async handleAgentStart(ws: AuthenticatedWebSocket, runId: string) {
        if (!ws.userId || !ws.supabase) {
            console.error('Attempt to start agent without authentication');
            return;
        }

        try {
            const runData = await this.fetchRunData(ws, runId);
            if (!runData) return;

            if (runData.status === 'COMPLETED' || runData.status === 'FAILED') {
                this.sendExistingRunData(ws, runData);
                return;
            }

            await this.updateRunStatus(ws, runId, ws.userId, 'INPROGRESS', [], null, null);
            const agent = await this.initializeAgent(runId);
            
            // Start periodic screenshot updates
            this.startPeriodicScreenshotUpdates(ws, runId, agent);

            const result = await agent.performTask(runData.run_objective);
            const executedCommands = await agent.getExecutedCommands();

            await this.updateRunStatus(
                ws, 
                runId, 
                ws.userId, 
                'COMPLETED', 
                result.steps, 
                result.finalAnswer,
                executedCommands
            );

            this.sendCompletionMessage(ws, result, executedCommands);

        } catch (error) {
            await this.handleAgentError(ws, runId, ws.userId, error);
        } finally {
            this.cleanupAgent(runId);
        }
    }

    private async fetchRunData(ws: AuthenticatedWebSocket, runId: string) {
        const { data: runDataArray, error: runError } = await ws.supabase
            .from('agent_runs')
            .select('run_objective, status, steps, commands')
            .eq('id', runId)
            .eq('user_id', ws.userId)
            .returns();

        if (runError || !runDataArray?.length) {
            console.error('Failed to fetch run data:', runError?.message || 'No data found');
            return null;
        }

        return runDataArray[0] as Pick<AgentRun, 'run_objective' | 'status' | 'steps' | 'commands'>;
    }

    private sendExistingRunData(ws: AuthenticatedWebSocket, runData: any) {
        ws.send(JSON.stringify({
            status: runData.status.toLowerCase(),
            finalAnswer: runData.steps?.finalAnswer || `This run is already in ${runData.status} state`,
            steps: runData.steps?.steps || [],
            commands: runData.commands || []
        }));
        ws.close();
    }

    private async initializeAgent(runId: string): Promise<ExtendedAIBrowserAgent> {
        const agent = new AIBrowserAgent() as unknown as ExtendedAIBrowserAgent;
        await agent.initialize();
        this.activeAgents.set(runId, agent);
        return agent;
    }

    private sendCompletionMessage(ws: AuthenticatedWebSocket, result: any, commands: ScriptCommand[]) {
        ws.send(JSON.stringify({
            type: 'completion',
            status: 'completed',
            finalAnswer: result.finalAnswer,
            steps: result.steps,
            commands
        }));
    }

    private async handleAgentError(ws: AuthenticatedWebSocket, runId: string, userId: string, error: any) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        const agent = this.activeAgents.get(runId);
        const executedCommands = agent ? await agent.getExecutedCommands() : [];
        
        await this.updateRunStatus(
            ws, 
            runId, 
            userId, 
            'FAILED', 
            [], 
            errorMessage,
            executedCommands
        );

        ws.send(JSON.stringify({
            type: 'completion',
            status: 'failed',
            finalAnswer: errorMessage,
            commands: executedCommands
        }));
    }

    private cleanupAgent(runId: string) {
        const agent = this.activeAgents.get(runId);
        if (agent) {
            agent.close().catch(console.error);
            this.activeAgents.delete(runId);
        }
        this.stopPeriodicScreenshotUpdates(runId);
    }

    private setupWebSocketServer() {
        this.wss.on('connection', this.handleConnection.bind(this));
        this.wss.on('error', (error) => console.error('WebSocket server error:', error));
    }

    private handleConnection(ws: WebSocket) {
        const client = Object.assign(ws, {
            isAlive: true,
            userId: undefined,
            supabase: undefined
        }) as AuthenticatedWebSocket;

        ws.on('pong', () => {
            client.isAlive = true;
        });

        ws.on('message', (data: WebSocket.RawData) => {
            this.handleMessage(client, data.toString());
        });

        ws.on('close', () => {
            console.log('Client disconnected');
        });

        ws.on('error', (error: Error) => {
            console.error('WebSocket client error:', error);
        });
    }

    private async handleMessage(client: AuthenticatedWebSocket, message: string) {
        try {
            const data: WebSocketMessage = JSON.parse(message);
            
            if (data.type === 'authenticate') {
                await this.handleAuthentication(client, data.token);
            } else if (!client.userId) {
                this.handleUnauthenticatedMessage(client);
            } else if (data.type === 'start_agent' && data.runId) {
                await this.handleAgentStart(client, data.runId);
            }
        } catch (error) {
            console.error('Error handling WebSocket message:', error);
            client.send(JSON.stringify({
                type: 'error',
                error: 'Failed to process message'
            }));
        }
    }

    private async handleAuthentication(client: AuthenticatedWebSocket, token?: string) {
        if (!token) {
            client.send(JSON.stringify({
                type: 'authentication',
                status: 'failed',
                error: 'No token provided'
            }));
            return;
        }

        const userId = await this.authenticateUser(token);
        if (userId) {
            this.setupAuthenticatedClient(client, userId, token);
        } else {
            this.handleFailedAuthentication(client);
        }
    }

    private setupAuthenticatedClient(client: AuthenticatedWebSocket, userId: string, token: string) {
        client.userId = userId;
        client.supabase = createClient(config.supabaseUrl!, config.supabaseKey!, {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
                detectSessionInUrl: false
            },
            global: {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        });
        client.send(JSON.stringify({
            type: 'authentication',
            status: 'success'
        }));
    }

    private handleFailedAuthentication(client: AuthenticatedWebSocket) {
        client.send(JSON.stringify({
            type: 'authentication',
            status: 'failed',
            error: 'Invalid authentication token'
        }));
        client.close();
    }

    private handleUnauthenticatedMessage(client: AuthenticatedWebSocket) {
        client.send(JSON.stringify({
            type: 'error',
            error: 'Not authenticated'
        }));
        client.close();
    }

    private async updateRunStatus(
        ws: AuthenticatedWebSocket, 
        runId: string, 
        userId: string, 
        status: AgentRunStatus,
        steps: Step[] | null,
        finalAnswer: string | null,
        commands: ScriptCommand[] | null = null
    ) {
        if (!ws.supabase) {
            console.error('No authenticated Supabase client available');
            return;
        }

        const updateData: any = {
            status,
            completed_at: status !== 'INPROGRESS' ? new Date().toISOString() : null
        };

        if (status === 'COMPLETED' || status === 'FAILED') {
            updateData.steps = {
                steps: steps || [],
                finalAnswer: finalAnswer || ''
            };
            updateData.commands = commands;
        }

        const { error } = await ws.supabase
            .from('agent_runs')
            .update(updateData)
            .eq('id', runId)
            .eq('user_id', userId);

        if (error) {
            console.error('Failed to update run status:', error);
        }
    }

    public close() {
        clearInterval(this.heartbeatInterval);
        
        // Clear all screenshot intervals
        this.screenshotIntervals.forEach((interval) => clearInterval(interval));
        this.screenshotIntervals.clear();
        
        // Close all active agents
        this.activeAgents.forEach((agent) => agent.close().catch(console.error));
        this.activeAgents.clear();

        this.wss.close();
    }
} 