import { MeshBuilder, Scene, StandardMaterial, Vector3 } from '@babylonjs/core'

export const createBoundaryWalls = (scene: Scene, bounds = { minX: 0, maxX: 100, minZ: 0, maxZ: 100 }) => {
  const { minX, maxX, minZ, maxZ } = bounds
  const wallThickness = 1
  const wallHeight = 40

  const invisibleMat = new StandardMaterial("", scene)
  invisibleMat.alpha = 0


  const leftWall = MeshBuilder.CreateBox("leftWall", {
    width: wallThickness,
    height: wallHeight,
    depth: maxZ - minZ
  }, scene)
  leftWall.position = new Vector3(minX - wallThickness / 2, wallHeight / 2, (maxZ + minZ) / 2)
  leftWall.material = invisibleMat
  leftWall.checkCollisions = true

  const rightWall = MeshBuilder.CreateBox("rightWall", {
    width: wallThickness,
    height: wallHeight,
    depth: maxZ - minZ
  }, scene)
  rightWall.position = new Vector3(maxX + wallThickness / 2, wallHeight / 2, (maxZ + minZ) / 2)
  rightWall.material = invisibleMat
  rightWall.checkCollisions = true

  const topWall = MeshBuilder.CreateBox("topWall", {
    width: maxX - minX + 2 * wallThickness,
    height: wallHeight,
    depth: wallThickness
  }, scene)
  topWall.position = new Vector3((minX + maxX) / 2, wallHeight / 2, maxZ + wallThickness / 2)
  topWall.material = invisibleMat
  topWall.checkCollisions = true

  const bottomWall = MeshBuilder.CreateBox("bottomWall", {
    width: maxX - minX + 2 * wallThickness,
    height: wallHeight,
    depth: wallThickness
  }, scene)
  bottomWall.position = new Vector3((minX + maxX) / 2, wallHeight / 2, minZ - wallThickness / 2)
  bottomWall.material = invisibleMat
  bottomWall.checkCollisions = true
}
