# WebSocket Implementation Guide for Frontend

## Overview
This document outlines the WebSocket implementation for real-time communication between the frontend and the AI Agent system.

## WebSocket Connection Details
- **WebSocket Server URL**: `ws://your-server-url/ws`
- **Protocol**: WebSocket (ws:// or wss:// for secure connections)

## Message Types

### 1. Authentication Message
First message that must be sent after connection to authenticate the WebSocket connection.

```typescript
// Type definition
interface AuthenticationMessage {
  type: 'authenticate';
  token: string; // JWT token
}

// Example usage
const authMessage: AuthenticationMessage = {
  type: 'authenticate',
  token: 'your-jwt-token'
};
ws.send(JSON.stringify(authMessage));
```

### 2. Authentication Response
Server response for authentication attempt.

```typescript
interface AuthenticationResponse {
  type: 'authentication';
  status: 'success' | 'failed';
  error?: string;
}

// Success example
{
  type: 'authentication',
  status: 'success'
}

// Failed example
{
  type: 'authentication',
  status: 'failed',
  error: 'Invalid authentication token'
}
```

### 3. Start Agent Message
Message to initiate an agent run.

```typescript
interface StartAgentMessage {
  type: 'start_agent';
  runId: string;
}

// Example
const startMessage: StartAgentMessage = {
  type: 'start_agent',
  runId: 'unique-run-id'
};
ws.send(JSON.stringify(startMessage));
```

### 4. Step Update Message
Server sends these messages during agent execution.

```typescript
interface StepUpdate {
  type: 'step_update';
  stepNumber: number;
  screenshot: string; // Base64 encoded screenshot
  action: {
    type: string;
    [key: string]: any; // Additional action-specific parameters
  };
  explanation: string;
}

// Example
{
  type: 'step_update',
  stepNumber: 1,
  screenshot: 'base64-encoded-image',
  action: {
    type: 'click',
    selector: '#submit-button',
    explanation: 'Clicking submit button'
  },
  explanation: 'Performing click action'
}
```

### 5. Completion Message
Sent when agent completes its task.

```typescript
interface CompletionMessage {
  type: 'completion';
  status: 'success' | 'failed';
  commands?: any[];
  error?: string;
}

// Success example
{
  type: 'completion',
  status: 'success',
  commands: [/* array of executed commands */]
}

// Error example
{
  type: 'completion',
  status: 'failed',
  error: 'Failed to complete task'
}
```

### 6. Error Message
Generic error messages from server.

```typescript
interface ErrorMessage {
  type: 'error';
  error: string;
}
```

## Frontend Implementation Example

```typescript
class AgentWebSocketClient {
  private ws: WebSocket;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private heartbeatInterval?: number;

  constructor(private serverUrl: string, private token: string) {
    this.connect();
  }

  private connect() {
    this.ws = new WebSocket(this.serverUrl);
    this.setupEventListeners();
    this.startHeartbeat();
  }

  private setupEventListeners() {
    this.ws.onopen = () => {
      console.log('Connected to WebSocket');
      this.authenticate();
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.handleMessage(message);
    };

    this.ws.onclose = () => {
      console.log('WebSocket connection closed');
      this.handleReconnect();
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  private authenticate() {
    const authMessage: AuthenticationMessage = {
      type: 'authenticate',
      token: this.token
    };
    this.send(authMessage);
  }

  private handleMessage(message: any) {
    switch (message.type) {
      case 'authentication':
        this.handleAuthenticationResponse(message);
        break;
      case 'step_update':
        this.handleStepUpdate(message);
        break;
      case 'completion':
        this.handleCompletion(message);
        break;
      case 'error':
        this.handleError(message);
        break;
    }
  }

  private startHeartbeat() {
    this.heartbeatInterval = window.setInterval(() => {
      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.send('ping');
      }
    }, 30000);
  }

  public startAgent(runId: string) {
    const message: StartAgentMessage = {
      type: 'start_agent',
      runId
    };
    this.send(message);
  }

  private send(message: any) {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected');
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => this.connect(), 5000 * this.reconnectAttempts);
    }
  }

  public close() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    this.ws.close();
  }

  // Event handlers - implement these based on your UI needs
  private handleAuthenticationResponse(message: AuthenticationResponse) {
    // Handle authentication response
  }

  private handleStepUpdate(message: StepUpdate) {
    // Handle step updates
  }

  private handleCompletion(message: CompletionMessage) {
    // Handle completion
  }

  private handleError(message: ErrorMessage) {
    // Handle errors
  }
}

// Usage example
const client = new AgentWebSocketClient('ws://your-server-url/ws', 'your-jwt-token');

// Start an agent run
client.startAgent('run-123');
```

## Important Implementation Notes

1. **Authentication Flow**:
   - Connect to WebSocket
   - Send authentication message immediately
   - Wait for authentication success before sending other messages
   - Handle authentication failures appropriately

2. **Heartbeat Mechanism**:
   - Server sends ping every 30 seconds
   - Client should respond with pong
   - Implement reconnection logic for connection losses

3. **Error Handling**:
   - Implement robust error handling
   - Handle connection losses gracefully
   - Implement exponential backoff for reconnection attempts

4. **State Management**:
   - Track connection state
   - Track authentication state
   - Track active agent runs

5. **UI Considerations**:
   - Show loading states during connection/authentication
   - Display step updates in real-time
   - Show error messages to users
   - Display screenshots from step updates
   - Show completion status and results

## Security Considerations

1. Always use secure WebSocket connections (wss://) in production
2. Never send sensitive data in plain text
3. Validate all incoming messages
4. Implement proper token management
5. Handle token expiration gracefully
