import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class WebsocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('WebsocketGateway');

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway Initialized');
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
    
    // Support joining room by userId or projectID to send targeted updates
    const userId = client.handshake.query.userId;
    if (userId) {
      client.join(`user_${userId}`);
      this.logger.log(`Client ${client.id} joined room user_${userId}`);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  /**
   * Sends AI QR generation update to a specific user.
   */
  sendProjectUpdate(userId: string, data: { projectId: string; status: string; progress?: number; generatedQrUrl?: string; error?: string }) {
    this.server.to(`user_${userId}`).emit('project_update', data);
    this.logger.log(`Sent project update to user_${userId} for project ${data.projectId}: ${data.status}`);
  }

  /**
   * Sends system updates to all users or admins.
   */
  sendBroadcast(event: string, data: any) {
    this.server.emit(event, data);
  }
}
