import Phaser from 'phaser';
//@ts-ignore
import OnChainScene from './scenes/OnChainScene3D/OnChainScene3D';
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
  scene: [OnChainScene],
  ...Canvas({ antialias: true })
}
let init = false;
const Game3DOnChain =  () => {
  if(!init){
    enable3d(() => new Phaser.Game(Game3DConfig)).withPhysics('/lib/ammo');
    init = true;
  }
}
export default Game3DOnChain
