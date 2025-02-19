import { Vector3 } from '@babylonjs/core'

export type ZoneCategory =
	| 'residential'
	| 'business'
	| 'public'
	| 'park'
	| 'hospital'
	| 'v_sidewalk'
	| 'h_sidewalk'

export interface IZone {
	id: string
	category: ZoneCategory
	maxAgents: number
	contagionLevel: number
	color: string
	position: Vector3
	size: { width: number; depth: number }
	currentAgents: number
}

export interface IZoneConfig {
	category: ZoneCategory
	maxAgents: number
	contagionLevel: number
	color: string
	position: Vector3
}
