import { Vector3 } from '@babylonjs/core'

export interface GraphEdge {
  nodeId: string
  cost: number
}

export interface GraphNode {
  id: string
  position: Vector3
  neighbors: GraphEdge[]
}

export class Graph {
  private nodes: Map<string, GraphNode> = new Map()

  constructor(nodes: GraphNode[]) {
    for (const node of nodes) {
      this.nodes.set(node.id, node)
    }
  }

  public getNode(id: string): GraphNode | undefined {
    return this.nodes.get(id)
  }

  public getAllNodes(): GraphNode[] {
    return [...this.nodes.values()]
  }


  public addNode(node: GraphNode) {
    this.nodes.set(node.id, node)
  }

  public removeNode(id: string) {
    this.nodes.delete(id)
  }
}
