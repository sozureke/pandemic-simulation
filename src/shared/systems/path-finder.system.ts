import { Vector3 } from '@babylonjs/core'
import { Graph } from './graph.system'


interface PathData {
  costFromStart: number
  estimatedTotalCost: number
  parent: string | null
}

export class PathFinder {
  private graph: Graph

  constructor(graph: Graph) {
    this.graph = graph
  }

  findPath(startId: string, goalId: string): string[] {
    if (startId === goalId) return [startId]
    const goalNode = this.graph.getNode(goalId)
    if (!goalNode) return []

    const openSet = new Set<string>()
    const closedSet = new Set<string>()
    const dataMap = new Map<string, PathData>()

    for (const node of this.graph.getAllNodes()) {
      dataMap.set(node.id, {
        costFromStart: Infinity,
        estimatedTotalCost: Infinity,
        parent: null
      })
    }

    const startData = dataMap.get(startId)
    if (!startData) return []

    startData.costFromStart = 0
    startData.estimatedTotalCost = this.heuristic(startId, goalId)
    openSet.add(startId)

    while (openSet.size > 0) {
      const currentId = this.getLowestEstimated(openSet, dataMap)
      if (!currentId) break
      if (currentId === goalId) {
        return this.reconstructPath(dataMap, goalId)
      }

      openSet.delete(currentId)
      closedSet.add(currentId)

      const currentNode = this.graph.getNode(currentId)
      if (!currentNode) continue

      for (const edge of currentNode.neighbors) {
        const neighborId = edge.nodeId
        if (closedSet.has(neighborId)) continue

        const neighborNode = this.graph.getNode(neighborId)
        if (!neighborNode) continue

        if (goalNode.type !== 'building' && neighborNode.type === 'building') {
          continue
        }

        const currentData = dataMap.get(currentId)
        const neighborData = dataMap.get(neighborId)
        if (!currentData || !neighborData) continue

        const newCost = currentData.costFromStart + edge.cost
        if (!openSet.has(neighborId)) {
          openSet.add(neighborId)
        }
        if (newCost < neighborData.costFromStart) {
          neighborData.parent = currentId
          neighborData.costFromStart = newCost
          neighborData.estimatedTotalCost = newCost + this.heuristic(neighborId, goalId)
        }
      }
    }
    return []
  }

  getClosestNodeId(pos: Vector3): string | null {
    let best: string | null = null
    let dist = Infinity
    for (const node of this.graph.getAllNodes()) {
      const d = Vector3.Distance(node.position, pos)
      if (d < dist) {
        dist = d
        best = node.id
      }
    }
    return best
  }

  private heuristic(aId: string, bId: string): number {
    const a = this.graph.getNode(aId)
    const b = this.graph.getNode(bId)
    if (!a || !b) return Infinity
    return Vector3.Distance(a.position, b.position)
  }

  private getLowestEstimated(openSet: Set<string>, dataMap: Map<string, PathData>): string | null {
    let best: string | null = null
    let minEstimate = Infinity
    for (const nodeId of openSet) {
      const d = dataMap.get(nodeId)
      if (d && d.estimatedTotalCost < minEstimate) {
        minEstimate = d.estimatedTotalCost
        best = nodeId
      }
    }
    return best
  }

  private reconstructPath(dataMap: Map<string, PathData>, goalId: string): string[] {
    const path: string[] = []
    let current: string | null = goalId
    while (current) {
      path.push(current)
      current = dataMap.get(current)?.parent || null
    }
    return path.reverse()
  }
}
