import {
	Color3,
	MeshBuilder,
	Scene,
	StandardMaterial,
	Vector3
} from '@babylonjs/core'
import { IZone } from '@/types/index'
import { ZoneManager } from '../systems'

export const isPointInZone = (point: Vector3, zone: IZone): boolean => {
	const halfWidth = zone.size.width / 2
	const halfDepth = zone.size.depth / 2

	return (
		point.x >= zone.position.x - halfWidth &&
		point.x <= zone.position.x + halfWidth &&
		point.z >= zone.position.z - halfDepth &&
		point.z <= zone.position.z + halfDepth
	)
}

export const updateNumberOfAgentsInZone = (
	zone: IZone,
	delta: number
): void => {
	zone.currentAgents += delta
	if (zone.currentAgents < 0) zone.currentAgents = 0
	if (zone.currentAgents > zone.maxAgents) zone.currentAgents = zone.maxAgents
}

export const createZoneVisuals = (scene: Scene, zoneManager: ZoneManager) => {
	const zones = zoneManager.getZones() || []

	zones.forEach(zone => {
		const plane = MeshBuilder.CreateGround(
			`zone_${zone.id}`,
			{ width: zone.size.width, height: zone.size.depth },
			scene
		)

		plane.position = new Vector3(zone.position.x, 3.05, zone.position.z)
		plane.rotation.x = 0

		const material = new StandardMaterial(`zone_mat_${zone.id}`, scene)
		material.diffuseColor = Color3.FromHexString(zone.color)
		material.alpha = 0.3
		plane.material = material
	})
}
