import { Color3, Mesh, MeshBuilder, Scene, StandardMaterial, Vector3 } from '@babylonjs/core'
import { Graph } from './graph.system'
import { PathFinder } from './path-finder.system'
import { ZoneManager } from './zone.system'

export enum AgentState {
  Healthy = 'Healthy',
  Incubating = 'Incubating',
  Infected = 'Infected',
  Vaccinated = 'Vaccinated'
}

export class Agent {
  public state: AgentState
  public position: Vector3
  public speed: number
  public mesh: Mesh
  public scene: Scene

  private path: Vector3[] = []
  private pathIndex: number = 0

  public timeOfDay: number = 0
  public fearLevel: number = 0
  public hunterLevel: number = 0

  public incubationTimer: number = 0
  public vaccineTimer: number = 0

  public targetZone: string | null = null

  public money: number = 100
  public food: number = 50
  public energy: number = 100

  private decisionCooldown = 10

  private zoneManager: ZoneManager
  private pathfinder: PathFinder
  private cityGraph: Graph

  constructor(
    scene: Scene,
    position: Vector3,
    state: AgentState = AgentState.Healthy,
    speed: number = 1,
    zoneManager: ZoneManager,
    pathfinder: PathFinder,
    cityGraph: Graph
  ) {
    this.scene = scene
    this.position = position.clone()
    this.state = state
    this.speed = speed
    this.zoneManager = zoneManager
    this.pathfinder = pathfinder
    this.cityGraph = cityGraph



    this.mesh = MeshBuilder.CreateSphere('agent', { diameter: 2 }, scene)
    this.mesh.position = this.position.clone()
    this.mesh.checkCollisions = false

    this.updateColor()
  }

  public update(deltaTime: number): void {
    this.timeOfDay += deltaTime
    this.updateTimers(deltaTime)
    this.updateResources(deltaTime)
    this.decisionCooldown -= deltaTime
    if (this.decisionCooldown <= 0) {
      this.updateBehavior()
      this.decisionCooldown = 60
    }
    if (this.path.length === 0 || this.pathIndex >= this.path.length) return
    const target = this.path[this.pathIndex]
    const dist = Vector3.Distance(this.position, target)
    if (dist < 1) {
      this.pathIndex++
      if (this.pathIndex >= this.path.length) {
        this.path = []
        this.pathIndex = 0
      }
      return
    }
    const direction = target.subtract(this.position).normalize()
    this.move(direction, deltaTime)
  }

  private updateTimers(deltaTime: number): void {
    if (this.state === AgentState.Incubating) {
      this.incubationTimer -= deltaTime
      if (this.incubationTimer <= 0) {
        this.setState(AgentState.Infected)
      }
    }
    if (this.state === AgentState.Vaccinated) {
      this.vaccineTimer -= deltaTime
      if (this.vaccineTimer <= 0) {
        this.setState(AgentState.Healthy)
      }
    }
  }

  private updateResources(deltaTime: number): void {
    const currentZone = this.zoneManager.getZoneForPosition(this.position)
    if (!currentZone) return

    switch (currentZone.category) {
      case 'residential':
        this.energy = Math.min(this.energy + 0.1 * deltaTime, 100)
        this.food = Math.max(this.food - 0.01 * deltaTime, 0)
        break
      case 'business':
        this.money = Math.min(this.money + 0.2 * deltaTime, 999)
        this.energy = Math.max(this.energy - 0.05 * deltaTime, 0)
        break
      case 'public':
        if (this.money > 0) {
          const buyRate = 0.1 * deltaTime
          this.food = Math.min(this.food + buyRate, 100)
          this.money = Math.max(this.money - buyRate, 0)
        }
        this.energy = Math.max(this.energy - 0.02 * deltaTime, 0)
        break
    }
  }

  private updateBehavior(): void {
    this.updateFearAndHunter()
    const hours = Math.floor(this.timeOfDay % 24)
    switch (this.state) {
      case AgentState.Healthy:
      case AgentState.Vaccinated:
        if (this.fearLevel > 0.7) {
          if (this.targetZone !== 'residential') {
            this.targetZone = 'residential'
            this.requestNewPath(this.targetZone)
          }
        } else {
          let zoneType = ''
          if (hours < 8) zoneType = 'residential'
          else if (hours < 16) zoneType = 'business'
          else if (hours < 20) zoneType = 'public'
          else zoneType = 'residential'
          if (this.targetZone !== zoneType) {
            this.targetZone = zoneType
            this.requestNewPath(this.targetZone)
          }
        }
        break
  
      case AgentState.Incubating:
        let incZone = ''
        if (hours < 8) incZone = 'residential'
        else if (hours < 16) incZone = 'business'
        else if (hours < 20) incZone = 'public'
        else incZone = 'residential'
        if (this.targetZone !== incZone) {
          this.targetZone = incZone
          this.requestNewPath(this.targetZone)
        }
        break
  
      case AgentState.Infected:
        if (this.hunterLevel > 0.5) {
          const huntZone = (hours < 16) ? 'business' : 'public'
          if (this.targetZone !== huntZone) {
            this.targetZone = huntZone
            this.requestNewPath(this.targetZone)
          }
        } else {
          if (this.targetZone !== 'public') {
            this.targetZone = 'public'
            this.requestNewPath(this.targetZone)
          }
        }
        break
    }
  }
  

  private updateFearAndHunter(): void {
    if (Math.random() < 0.01) {
      this.fearLevel = Math.min(this.fearLevel + 0.01, 1)
    }
    if (Math.random() < 0.01) {
      this.fearLevel = Math.max(this.fearLevel - 0.01, 0)
    }
    if (this.state === AgentState.Infected) {
      if (Math.random() < 0.01) {
        this.hunterLevel = Math.min(this.hunterLevel + 0.01, 1)
      }
      if (Math.random() < 0.01) {
        this.hunterLevel = Math.max(this.hunterLevel - 0.01, 0)
      }
    }
  }

  private move(direction: Vector3, deltaTime: number): void {
    const displacement = direction.scale(this.speed * deltaTime)
    this.position.addInPlace(displacement)
    this.mesh.position.copyFrom(this.position)
  }

  public setPath(path: Vector3[]): void {
    this.path = path
    this.pathIndex = 0
  }

  public setState(newState: AgentState): void {
    this.state = newState
    this.updateColor()
  }

  private requestNewPath(zoneType: string): void {
    const zone = this.zoneManager.getRandomZoneByCategory(zoneType)
    if (!zone) return

    const startId = this.pathfinder.getClosestNodeId(this.position)
    const goalId = this.pathfinder.getClosestNodeId(zone.position)
    if (!startId || !goalId) return

    const nodePath = this.pathfinder.findPath(startId, goalId)
    const coords = nodePath
      .map(id => this.cityGraph.getNode(id)?.position.clone())
      .filter(Boolean) as Vector3[]

    this.setPath(coords)
  }

  private updateColor(): void {
    const mat = new StandardMaterial('agentMat', this.scene)
    mat.diffuseColor =
      this.state === AgentState.Healthy ? Color3.Green() :
      this.state === AgentState.Infected ? Color3.Red() :
      this.state === AgentState.Vaccinated ? Color3.Blue() :
      new Color3(1, 0, 1) 
    this.mesh.material = mat
  }
}


export class AgentManager {
  public agents: Agent[] = []
  private scene: Scene
  private zoneManager: ZoneManager
  private pathfinder: PathFinder
  private cityGraph: Graph

  constructor(
    scene: Scene,
    zoneManager: ZoneManager,
    pathfinder: PathFinder,
    cityGraph: Graph
  ) {
    this.scene = scene
    this.zoneManager = zoneManager
    this.pathfinder = pathfinder
    this.cityGraph = cityGraph
  }

  public spawnAgent(
  position: Vector3,
  state: AgentState = AgentState.Healthy,
  speed: number = 1
): Agent {
  const agent = new Agent(
    this.scene,
    position,
    state,
    speed,
    this.zoneManager,
    this.pathfinder,
    this.cityGraph
  )
  if (state === AgentState.Incubating && agent.incubationTimer <= 0) {
    agent.incubationTimer = 100
  }
  if (state === AgentState.Vaccinated && agent.vaccineTimer <= 0) {
    agent.vaccineTimer = 30
  }
  this.agents.push(agent)
  this.zoneManager.addAgentToZone(position)
  return agent
}

  public update(deltaTime: number): void {
    this.agents.forEach(agent => agent.update(deltaTime))
    this.checkInfections()
    this.updateFearAndHunter()
  }

  private checkInfections(): void {
    const infectionRadius = 2.5
    const baseInfectionProbability = 1.0

    for (let i = 0; i < this.agents.length; i++) {
      for (let j = i + 1; j < this.agents.length; j++) {
        const a1 = this.agents[i]
        const a2 = this.agents[j]

        const canInfect =
          (a1.state === AgentState.Infected && a2.state === AgentState.Healthy) ||
          (a2.state === AgentState.Infected && a1.state === AgentState.Healthy) ||
          (a1.state === AgentState.Infected && a2.state === AgentState.Vaccinated) ||
          (a2.state === AgentState.Infected && a1.state === AgentState.Vaccinated)

        if (canInfect) {
          const dist = Vector3.Distance(a1.position, a2.position)
          if (dist < infectionRadius) {
            let infectionProbability = baseInfectionProbability
            if (
              (a1.state === AgentState.Infected && a2.state === AgentState.Vaccinated) ||
              (a2.state === AgentState.Infected && a1.state === AgentState.Vaccinated)
            ) {
              infectionProbability = 0.2
            }

            if (Math.random() < infectionProbability) {
              if (a1.state === AgentState.Healthy || a1.state === AgentState.Vaccinated) {
                a1.setState(AgentState.Incubating)
                a1.incubationTimer = 5
              } else {
                a2.setState(AgentState.Incubating)
                a2.incubationTimer = 5
              }
            }
          }
        }
      }
    }
  }

  private updateFearAndHunter(): void {
    const total = this.agents.length
    if (total === 0) return

    const infectedCount = this.agents.filter(a => a.state === AgentState.Infected).length
    const infectionRate = infectedCount / total

    this.agents.forEach(agent => {
      if (agent.state === AgentState.Healthy || agent.state === AgentState.Vaccinated) {
        if (infectionRate > 0.5) {
          agent.fearLevel = Math.min(agent.fearLevel + 0.01, 1)
        } else {
          agent.fearLevel = Math.max(agent.fearLevel - 0.01, 0)
        }
      }
      if (agent.state === AgentState.Infected) {
        const healthyCount = this.agents.filter(a => a.state === AgentState.Healthy).length
        if (healthyCount < total * 0.3) {
          agent.hunterLevel = Math.min(agent.hunterLevel + 0.01, 1)
        } else {
          agent.hunterLevel = Math.max(agent.hunterLevel - 0.01, 0)
        }
      }
    })
  }
}