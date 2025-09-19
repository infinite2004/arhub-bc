import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  // Check if this is a Server-Sent Events request
  if (req.headers.get('accept') !== 'text/event-stream') {
    return new Response('Not Found', { status: 404 });
  }

  // Check authentication
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Create a readable stream for Server-Sent Events
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      
      // Send initial connection event
      const sendEvent = (event: string, data: any) => {
        const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(message));
      };

      // Send connection established event
      sendEvent('connected', {
        userId: session.user.id,
        timestamp: new Date().toISOString(),
      });

      // Set up periodic heartbeat
      const heartbeat = setInterval(() => {
        sendEvent('heartbeat', {
          timestamp: new Date().toISOString(),
        });
      }, 30000); // Every 30 seconds

      // Store the controller for this connection
      const connectionId = `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      (global as any).activeConnections = (global as any).activeConnections || new Map();
      (global as any).activeConnections.set(connectionId, {
        controller,
        userId: session.user.id,
        sendEvent,
      });

      // Clean up on close
      req.signal.addEventListener('abort', () => {
        clearInterval(heartbeat);
        (global as any).activeConnections?.delete(connectionId);
        controller.close();
      });

      // Handle client disconnect
      req.signal.addEventListener('close', () => {
        clearInterval(heartbeat);
        (global as any).activeConnections?.delete(connectionId);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    },
  });
}

// Utility function to broadcast events to all connected clients
export function broadcastEvent(event: string, data: any, userId?: string) {
  const connections = (global as any).activeConnections as Map<string, any>;
  if (!connections) return;

  const encoder = new TextEncoder();
  const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;

  for (const [connectionId, connection] of connections) {
    try {
      // If userId is specified, only send to that user
      if (userId && connection.userId !== userId) {
        continue;
      }

      connection.controller.enqueue(encoder.encode(message));
    } catch (error) {
      // Remove dead connections
      connections.delete(connectionId);
    }
  }
}

// Utility function to send event to specific user
export function sendEventToUser(userId: string, event: string, data: any) {
  broadcastEvent(event, data, userId);
}

// Utility function to get connection count
export function getConnectionCount(): number {
  const connections = (global as any).activeConnections as Map<string, any>;
  return connections ? connections.size : 0;
}
