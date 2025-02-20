import { initialZones } from '@/shared/config'
import { AgentManager, PathFinder, ZoneManager } from '@/shared/systems'
import { AgentState } from '@/shared/systems/agent.system'
import { cameraSetup, createBoundaryWalls, createCityGraph, createZoneVisuals, setupLights, visualizeGraph } from '@/shared/utils'
import {
	Color4,
	Engine,
	Quaternion,
	Scene,
	SceneLoader,
	Vector3
} from '@babylonjs/core'
import '@babylonjs/loaders'
import { FC, useEffect, useRef } from 'react'

export const Map: FC = () => {
	const canvasRef = useRef<HTMLCanvasElement | null>(null)
	const zoneManagerRef = useRef<ZoneManager | null>(null)
	const agentManagerRef = useRef<AgentManager | null>(null)

	useEffect(() => {
		const canvas = canvasRef.current
		if (!canvas) return

		const engine = new Engine(canvas, true)
		const scene = new Scene(engine)
		scene.clearColor = new Color4(0.1, 0.1, 0.1, 0)

		cameraSetup(scene)
		setupLights(scene)
		const cityGraph = createCityGraph()
		const pathFinder = new PathFinder(cityGraph)
		visualizeGraph(scene, cityGraph)
		createBoundaryWalls(scene, { minX: -50, maxX: 55, minZ: -50, maxZ: 55 })

		SceneLoader.Append(
			'/models/',
			'simulation_map.glb',
			scene,
			loadedScene => {
				const rootMesh = loadedScene.getMeshByName('__root__')
				zoneManagerRef.current = new ZoneManager(loadedScene)
				zoneManagerRef.current.initializeZones(initialZones)
				createZoneVisuals(loadedScene, zoneManagerRef.current)

				if (rootMesh) {
					rootMesh.rotationQuaternion = Quaternion.RotationAxis(
						new Vector3(1, 0, 0),
						-Math.PI / 2
					)
					rootMesh.scaling = new Vector3(0.1, 0.1, 0.1)
				}
				agentManagerRef.current = new AgentManager(loadedScene, zoneManagerRef.current, pathFinder, cityGraph)
				
				const agent2 = agentManagerRef.current.spawnAgent(new Vector3(48, 5, 0), AgentState.Healthy)
			},
			error => {
				console.error('Error while uploading the model:', error)
			}
		)

		engine.runRenderLoop(() => {
			const deltaTime = engine.getDeltaTime() / 100
			if (agentManagerRef.current) {
				agentManagerRef.current.update(deltaTime)
			}
			scene.render()
		})

		const handleResize = () => {
			engine.resize()
		}
		window.addEventListener('resize', handleResize)

		return () => {
			window.removeEventListener('resize', handleResize)
			engine.dispose()
		}
	}, [])

	return (
		<canvas
			ref={canvasRef}
			style={{
				width: '100vw',
				height: '100vh',
				display: 'block'
			}}
		/>
	)
}
