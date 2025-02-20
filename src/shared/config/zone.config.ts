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
  h_sidewalk: { maxAgents: 200, contagionLevel: 0.4, color: '#694623' },
  v_sidewalk: { maxAgents: 200, contagionLevel: 0.4, color: '#694623' }
}

const createZone = (category: ZoneCategory, position: Vector3): IZoneConfig => ({
  category,
  ...ZONE_SETTINGS[category],
  position
})

const generateZones = (category: ZoneCategory, positions: { x: number; z: number }[]): IZoneConfig[] =>
  positions.map(pos => createZone(category, new Vector3(pos.x, 0, pos.z)))

export const initialZones: IZoneConfig[] = [
  ...generateZones('residential', [
    { x: 40, z: 40 }, { x: 15, z: 40 },
    { x: 15, z: 15 }, { x: -10, z: -35 },
    { x: -35, z: -35 }
  ]),

  ...generateZones('public', [
    { x: -10, z: 40 }, { x: -10, z: 15 },
    { x: -35, z: -10 }
  ]),

  ...generateZones('business', [
    { x: -35, z: 40 }, { x: 40, z: -10 },
    { x: -10, z: -10 }
  ]),

  ...generateZones('park', [
    { x: 40, z: 15 }, { x: -35, z: 15 },
    { x: 40, z: -35 }
  ]),

  ...generateZones('hospital', [{ x: 15, z: -35 }]),

  ...generateZones('h_sidewalk', [
    { x: 52.5, z: 2.5 }, { x: 27.5, z: 2.5 },
    { x: 2.5, z: 2.5 }, { x: -22.5, z: 2.5 },
    { x: -47.5, z: 2.5 }
  ]),

  ...generateZones('v_sidewalk', [
    { x: 2.5, z: 52.5 }, { x: 2.5, z: 27.5 },
    { x: 2.5, z: 2.5 }, { x: 2.5, z: -22.5 },
    { x: 2.5, z: -47.5 }
  ])
]
