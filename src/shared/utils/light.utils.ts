import { DirectionalLight, HemisphericLight, Scene, Vector3 } from '@babylonjs/core'

export const setupLights = (scene: Scene): void => {
  const hemisphericLight = new HemisphericLight('hemiLight', new Vector3(0, 1, 0), scene)
  hemisphericLight.intensity = 0.2

  const directionalLight = new DirectionalLight('dirLight', new Vector3(-1, -4, -10), scene)
  directionalLight.intensity = 0.8
  directionalLight.position = new Vector3(20, 50, -20)
}
