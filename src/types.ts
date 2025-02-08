export interface ScriptCommand {
    type: 'navigation' | 'click' | 'type' | 'typeAndEnter' | 'scroll' | 'back' | 'search' | 'solveCaptcha';
    xpath?: string;
    value?: string;
    url?: string;
    identifier?: string;
    placeholder_value?: string;
    text?: string;
    query?: string;
}

export interface ElementInfo {
    isVisible: boolean;
    details: {
        tagName: string;
        id: string;
        className: string;
        src: string;
        display: string;
        visibility: string;
        width: number;
        height: number;
    };
}

export type AgentRunStatus = 'PENDING' | 'INPROGRESS' | 'FAILED' | 'COMPLETED';

export interface WebSocketMessage {
    type: string;
    runId?: string;
    token?: string;
}

export interface Step {
    number: number;
    action: string;
    explanation: string;
}

export interface AgentRunSteps {
    steps: Step[];
    finalAnswer: string;
}

export interface AgentRun {
    id: string;
    user_id: string;
    run_objective: string;
    started_at: string;
    completed_at: string | null;
    status: AgentRunStatus;
    steps: AgentRunSteps | null;
    commands: string[] | null;
}

// Extended WebSocket interface with custom properties
export interface AuthenticatedWebSocket {
    userId?: string;
    isAlive: boolean;
    supabase?: any;  // Using any for Supabase client type for simplicity
    send(data: string | Buffer | Buffer[] | Buffer): void;
    close(): void;
    terminate(): void;
    ping(): void;
    on(event: 'message', cb: (data: Buffer | Buffer[] | string) => void): void;
    on(event: 'close', cb: () => void): void;
    on(event: 'error', cb: (err: Error) => void): void;
    on(event: 'pong', cb: () => void): void;
}

export interface WebDriverAdapter {
    executeScript(script: string): void;
}

// Extended AIBrowserAgent interface for type safety
export interface ExtendedAIBrowserAgent {
    initialize(): Promise<void>;
    performTask(objective: string): Promise<{ steps: Step[]; finalAnswer: string }>;
    getExecutedCommands(): Promise<ScriptCommand[]>;
    close(): Promise<void>;
    captureScreenshot(): Promise<string | null>;
    onStepUpdate: ((step: Step) => void) | null;
} 

export interface Automation {
    id: string;
    user_id: string;
    automation_name: string;
    steps: ScriptCommand[];
    objective: string;
    created_at: string;
    updated_at?: string|null;
}

export interface AutomationResponse {
    message: string;
    data: {
        automations: Automation[];
    };
}

export interface CreateAutomationRequest {
    automationName: string;
    agentRunId: string;
  }