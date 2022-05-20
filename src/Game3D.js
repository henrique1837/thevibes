import Phaser from 'phaser';
//@ts-ignore
import MainScene3D from './scenes/MainScene3D';
import {
  enable3d,
  Canvas,
} from'@enable3d/phaser-extension';

const Game3DConfig = {
  type: Phaser.WEBGL,
  transparent: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: window.innerWidth, // * Math.max(1, window.devicePixelRatio / 2),
    height: window.innerHeight // * Math.max(1, window.devicePixelRatio / 2)
  },
  scene: [MainScene3D],
  ...Canvas({ antialias: true })
}
let init = false;
const Game3D =  () => {
  if(!init){
    enable3d(() => new Phaser.Game(Game3DConfig)).withPhysics('/lib/ammo');
    init = true;
  }
}
export default Game3D
