import { initialZones } from '@/shared/config'
import { ZoneManager } from '@/shared/systems'
import { cameraSetup, createZoneVisuals, setupLights } from '@/shared/utils'
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

	useEffect(() => {
		const canvas = canvasRef.current
		if (!canvas) return

		const engine = new Engine(canvas, true)
		const scene = new Scene(engine)
		scene.clearColor = new Color4(0.1, 0.1, 0.1, 0)

		cameraSetup(scene)
		setupLights(scene)

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
			},
			error => {
				console.error('Ошибка загрузки модели:', error)
			}
		)

		engine.runRenderLoop(() => {
			scene.render()
		})

		return () => {
			engine.dispose()
		}
	}, [])

	return (
		<>
			<canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
		</>
	)
}
