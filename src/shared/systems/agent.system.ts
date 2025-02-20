import { Color3, Mesh, MeshBuilder, Scene, StandardMaterial, Vector3 } from '@babylonjs/core'
import { ZoneManager } from './zone.system'

export enum AgentState {
  Healthy = 'Healthy',
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
  private pathIndex = 0

  constructor(scene: Scene, position: Vector3, state: AgentState = AgentState.Healthy, speed: number = 1) {
    this.scene = scene
    this.position = position.clone()
    this.state = state
    this.speed = speed

    this.mesh = MeshBuilder.CreateSphere('agent', { diameter: 2 }, scene)
    this.mesh.position = this.position.clone()
    this.mesh.checkCollisions = false
    this.updateColor()
  }

  updateColor(): void {
    const mat = new StandardMaterial('agentMat', this.scene)
    mat.diffuseColor =
      this.state === AgentState.Healthy ? new Color3(0, 1, 0) :
      this.state === AgentState.Infected ? new Color3(1, 0, 0) :
      new Color3(0, 0, 1)
    this.mesh.material = mat
  }

  public setPath(path: Vector3[]) {
    this.path = path
    this.pathIndex = 0
  }

  public update(deltaTime: number) {
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

  private move(direction: Vector3, deltaTime: number) {
    const displacement = direction.scale(this.speed * deltaTime)
    this.position.addInPlace(displacement)
    this.mesh.position.copyFrom(this.position)
  }

  public setState(newState: AgentState) {
    this.state = newState
    this.updateColor()
  }
}

export class AgentManager {
  public agents: Agent[] = []
  private scene: Scene
  private zoneManager: ZoneManager

  constructor(scene: Scene, zoneManager: ZoneManager) {
    this.scene = scene
    this.zoneManager = zoneManager
  }

  public spawnAgent(position: Vector3, state: AgentState = AgentState.Healthy, speed: number = 1): Agent {
    const agent = new Agent(this.scene, position, state, speed)
    this.agents.push(agent)
    this.zoneManager.addAgentToZone(position)
    return agent
  }

  public update(deltaTime: number) {
    this.agents.forEach(agent => agent.update(deltaTime))
    this.checkInfections()
  }

  private checkInfections() {
    const infectionRadius = 2.5
    const infectionProbability = 1.0

    for (let i = 0; i < this.agents.length; i++) {
      for (let j = i + 1; j < this.agents.length; j++) {
        const a1 = this.agents[i]
        const a2 = this.agents[j]

        const isPairInfectious =
          (a1.state === AgentState.Infected && a2.state === AgentState.Healthy) ||
          (a2.state === AgentState.Infected && a1.state === AgentState.Healthy)

        if (isPairInfectious) {
          const dist = Vector3.Distance(a1.position, a2.position)
          if (dist < infectionRadius) {
            if (Math.random() < infectionProbability) {
              if (a1.state === AgentState.Healthy) {
                a1.setState(AgentState.Infected)
              } else {
                a2.setState(AgentState.Infected)
              }
            }
          }
        }
      }
    }
  }
}
