import { IZoneConfig, ZoneCategory } from '@/types/zone.types'
import { Vector3 } from '@babylonjs/core'

const ZONE_SETTINGS: Record<
	ZoneCategory,
	{ maxAgents: number; contagionLevel: number; color: string }
> = {
	residential: { maxAgents: 20, contagionLevel: 0.2, color: '#FF5733' },
	public: { maxAgents: 70, contagionLevel: 0.7, color: '#33FF57' },
	business: { maxAgents: 50, contagionLevel: 0.5, color: '#478EFF' },
	park: { maxAgents: 80, contagionLevel: 0.8, color: '#f9ff4a' },
	hospital: { maxAgents: 30, contagionLevel: 0.1, color: '#fa8611' },
	h_sidewalk: { maxAgents: 200, contagionLevel: 0.4, color: '#ссссс' },
	v_sidewalk: { maxAgents: 200, contagionLevel: 0.4, color: '#ссссс' }
}

const createZone = (
	category: keyof typeof ZONE_SETTINGS,
	position: Vector3
): IZoneConfig => ({
	category,
	...ZONE_SETTINGS[category],
	position
})

const generateZones = (
	category: ZoneCategory,
	positions: { x: number; z: number }[]
): IZoneConfig[] =>
	positions.map(pos => createZone(category, new Vector3(pos.x, 0, pos.z)))

const ROWPOSITION = [40, 15, -10, -35]
const COLUMNPOSITIONS = [52.5, 27.5, 2.5, -22.5, -47.5]

export const initialZones: IZoneConfig[] = [
	...generateZones(
		'residential',
		ROWPOSITION.map(x => ({ x, z: 40 }))
	),
	...generateZones(
		'residential',
		ROWPOSITION.map(x => ({ x, z: 15 }))
	),
	...generateZones(
		'public',
		ROWPOSITION.map(x => ({ x, z: 15 }))
	),
	...generateZones(
		'business',
		ROWPOSITION.map(x => ({ x, z: -10 }))
	),
	...generateZones(
		'residential',
		ROWPOSITION.map(x => ({ x, z: -35 }))
	),
	...generateZones('hospital', [{ x: 15, z: -35 }]),

	...generateZones(
		'h_sidewalk',
		COLUMNPOSITIONS.map(x => ({ x, z: 2.5 }))
	),
	...generateZones(
		'v_sidewalk',
		COLUMNPOSITIONS.map(z => ({ x: 2.5, z }))
	)
]
