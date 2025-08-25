import { AudioNode, Connection } from '../types';

interface Point {
  x: number;
  y: number;
}

export class ProximityConnectionManager {
  private readonly CONNECT_DISTANCE = 150;
  private readonly CONNECTION_DELAY = 300;

  checkForAutoConnections(newNode: AudioNode, existingNodes: AudioNode[]): Connection[] {
    const connections: Connection[] = [];
    
    existingNodes.forEach(existingNode => {
      const distance = this.calculateDistance(
        { x: newNode.x, y: newNode.y }, 
        { x: existingNode.x, y: existingNode.y }
      );
      
      if (distance <= this.CONNECT_DISTANCE) {
        const connection: Connection = {
          id: `${newNode.id}-${existingNode.id}`,
          fromNodeId: newNode.id,
          toNodeId: existingNode.id
        };
        
        setTimeout(() => {
          this.animateConnection(connection);
        }, this.CONNECTION_DELAY);
        
        connections.push(connection);
      }
    });
    
    return connections;
  }
  
  private calculateDistance(pos1: Point, pos2: Point): number {
    return Math.sqrt(
      Math.pow(pos2.x - pos1.x, 2) + Math.pow(pos2.y - pos1.y, 2)
    );
  }
  
  private animateConnection(connection: Connection): void {
    // This will be handled by the visual components
    console.log(`Auto-connecting ${connection.fromNodeId} to ${connection.toNodeId}`);
  }
}