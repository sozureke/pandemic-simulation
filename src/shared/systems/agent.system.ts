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
  private destination: Vector3 | null = null

  // Карта: от -20 до 0 по обеим осям
  private readonly minX = -20
  private readonly maxX = 0
  private readonly minZ = -20
  private readonly maxZ = 0
  private readonly repulsionForce = 2

  constructor(scene: Scene, position: Vector3, state: AgentState = AgentState.Healthy, speed: number = 1) {
    this.scene = scene
    this.position = position.clone()
    this.state = state
    this.speed = speed

    this.mesh = MeshBuilder.CreateSphere('agent', { diameter: 2 }, scene)
    this.mesh.position = this.position.clone()
    this.mesh.checkCollisions = false // Агенты не сталкиваются между собой
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

  // Выбираем случайную точку по всей карте, а не относительно текущей позиции
  private getRandomDestination(): Vector3 {
    const x = Math.random() * (this.maxX - this.minX) + this.minX
    const z = Math.random() * (this.maxZ - this.minZ) + this.minZ
    return new Vector3(x, this.position.y, z)
  }

  // Если агент по каким-то причинам оказывается за границами, возвращаем вектор корректировки
  private getBoundaryRepulsion(): Vector3 {
    let rx = 0, rz = 0
    if (this.position.x < this.minX) rx = (this.minX - this.position.x) * this.repulsionForce
    else if (this.position.x > this.maxX) rx = -(this.position.x - this.maxX) * this.repulsionForce
    if (this.position.z < this.minZ) rz = (this.minZ - this.position.z) * this.repulsionForce
    else if (this.position.z > this.maxZ) rz = -(this.position.z - this.maxZ) * this.repulsionForce
    return new Vector3(rx, 0, rz)
  }

  update(deltaTime: number) {
    if (!this.destination || Vector3.Distance(this.position, this.destination) < 1) {
      this.destination = this.getRandomDestination()
      console.log(`New destination: ${this.destination.toString()}`)
    }
    let direction = this.destination.subtract(this.position).normalize()
    // Применяем корректировку, если агент за гранью карты
    direction = direction.add(this.getBoundaryRepulsion()).normalize()
    this.move(direction, deltaTime)
  }

  move(direction: Vector3, deltaTime: number) {
    const displacement = direction.scale(this.speed * deltaTime)
    this.position.addInPlace(displacement)
    this.mesh.position.copyFrom(this.position)
  }

  setState(newState: AgentState) {
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

  spawnAgent(position: Vector3, state: AgentState = AgentState.Healthy, speed: number = 1): Agent {
    const agent = new Agent(this.scene, position, state, speed)
    this.agents.push(agent)
    this.zoneManager.addAgentToZone(position)
    return agent
  }

  update(deltaTime: number) {
    this.agents.forEach(agent => agent.update(deltaTime))
  }
}
