import { Color3, MeshBuilder, Scene, StandardMaterial, Vector3 } from '@babylonjs/core'
import { Graph, GraphNode } from '../systems'

export const addEdge = (firstGraph: GraphNode, secondGraph: GraphNode): void => {
	const distance = Vector3.Distance(firstGraph.position, secondGraph.position)
	firstGraph.neighbors.push({ nodeId: secondGraph.id, cost: distance })
	secondGraph.neighbors.push({ nodeId: firstGraph.id, cost: distance })
}

export const generateCrossroadNodes = (): GraphNode[] => {
	const xVals = [-48, -23, 2.5, 27, 52.5]
  const zVals = [-48, -23, 2.5, 27, 52.5]
  const nodes: GraphNode[] = []
  let i = 1
  for (let x = 0; x < xVals.length; x++) {
    for (let z = 0; z < zVals.length; z++) {
      nodes.push({ id: `cross_${i}`, position: new Vector3(xVals[x], 4.2, zVals[z]), neighbors: [], type: 'sidewalk' })
      i++
    }
  }
  return nodes
}

export const generateBuildingNodes = (): GraphNode[] => {
	const positions = [
    new Vector3(40, 4.2, 40),  new Vector3(15, 4.2, 40),  new Vector3(-10, 4.2, 40),  new Vector3(-35, 0, 40),
    new Vector3(40, 4.2, 15),  new Vector3(15, 4.2, 15),  new Vector3(-10, 4.2, 15),  new Vector3(-35, 0, 15),
    new Vector3(40, 4.2, -10), new Vector3(15, 4.2, -10), new Vector3(-10, 4.2, -10), new Vector3(-35, 0, -10),
    new Vector3(40, 4.2, -35), new Vector3(15, 4.2, -35), new Vector3(-10, 4.2, -35), new Vector3(-35, 0, -35),
  ]
	
  const nodes: GraphNode[] = []
  let i = 1
  for (const pos of positions) {
    nodes.push({ id: `building_${i}`, position: pos, neighbors: [], type: 'building' })
    i++
  }
  return nodes
}


export const linkCrossroads = (nodes: GraphNode[]): void => {
	const size = 5
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const i = r * size + c
      const n = nodes[i]
      if (c < size - 1) addEdge(n, nodes[i + 1])
      if (r < size - 1) addEdge(n, nodes[i + size])
    }
  }
}

export const linkBuildingsToCrossroads = (buildings: GraphNode[], crossroads: GraphNode[],  maxDist = 30, maxConnections = 4): void => {
	for (const building of buildings) {
		const candidates = crossroads
		.map(crossroad => ({ node: crossroad, dist: Vector3.Distance(building.position, crossroad.position) }))
		.filter(item => item.dist <= maxDist)
		.sort((a, b) => a.dist - b.dist)

		const nearest = candidates.slice(0, maxConnections)
    for (const { node } of nearest) {
      addEdge(building, node)
	}
}
}


export const createCityGraph = (): Graph => {
	const crossroadNodes = generateCrossroadNodes()
  linkCrossroads(crossroadNodes)
  const buildingNodes = generateBuildingNodes()
  linkBuildingsToCrossroads(buildingNodes, crossroadNodes)
  return new Graph([...crossroadNodes, ...buildingNodes])
}

export const visualizeGraph = (scene: Scene, graph: Graph): void => {
	const nodes = graph.getAllNodes()
  const matNode = new StandardMaterial('nodeMat', scene)
  matNode.diffuseColor = Color3.Blue()
  const drawn = new Set<string>()
  for (const n of nodes) {
    const s = MeshBuilder.CreateSphere(`node_${n.id}`, { diameter: 3 }, scene)
    s.position.copyFrom(n.position)
    s.material = matNode
    for (const e of n.neighbors) {
      const key = [n.id, e.nodeId].sort().join('_')
      if (drawn.has(key)) continue
      drawn.add(key)
      const neighbor = graph.getNode(e.nodeId)
      if (!neighbor) continue
      const line = MeshBuilder.CreateLines(`edge_${n.id}_${e.nodeId}`, { points: [n.position, neighbor.position] }, scene)
      line.color = Color3.White()
    }
  }
}