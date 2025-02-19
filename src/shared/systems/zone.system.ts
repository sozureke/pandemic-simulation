import { IZone, IZoneConfig } from '@/types/index'
import { Scene, Vector3 } from '@babylonjs/core'
import { isPointInZone, updateNumberOfAgentsInZone } from '../utils'

export class ZoneManager {
	private zones: IZone[] = []
	constructor(private scene: Scene) {}

	public initializeZones(configs: IZoneConfig[]): void {
		this.zones = configs.map(config => {
			let size = { width: 20, depth: 20 }
			if (config.category === 'h_sidewalk') {
				size = { width: 5, depth: 95 }
			}

			if (config.category === 'v_sidewalk') {
				size = { width: 105, depth: 5 }
			}

			return {
				...config,
				id: `zone_${Math.random().toString(36).substr(2, 9)}`,
				size,
				currentAgents: 0
			}
		})
	}

	public getZoneForPosition(position: Vector3): IZone | null {
		return this.zones.find(zone => isPointInZone(position, zone)) || null
	}

	public addAgentToZone(position: Vector3): void {
		const zone = this.getZoneForPosition(position)
		if (zone && zone.currentAgents < zone.maxAgents) {
			updateNumberOfAgentsInZone(zone, 1)
		}
	}

	public removeAgentFromZone(position: Vector3): void {
		const zone = this.getZoneForPosition(position)
		if (zone && zone.currentAgents > 0) {
			updateNumberOfAgentsInZone(zone, -1)
		}
	}

	public getZones(): IZone[] {
		return this.zones
	}

	public getZoneById(id: string) {
		return this.zones.find(zone => zone.id === id) || null
	}
}
