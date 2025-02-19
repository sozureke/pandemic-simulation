import { ArcRotateCamera, Scene, Vector3 } from '@babylonjs/core'

export const cameraSetup = (scene: Scene): void => {
			const camera = new ArcRotateCamera('camera', Math.PI / 3, Math.PI / 4, 20, new Vector3(0, 0, 0), scene)
			camera.attachControl(scene.getEngine().getRenderingCanvas(), true)
			camera.lowerBetaLimit = 0.1
			camera.upperBetaLimit = Math.PI / 2.2
			camera.lowerRadiusLimit = 170
			camera.upperRadiusLimit = 200
}