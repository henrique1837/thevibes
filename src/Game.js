import Phaser from 'phaser';

import MainScene from './scenes/MainScene';



const Game = {
  width: "100%",
  height: "80%",
  type: Phaser.AUTO,
  render: {
    antialias: false,
    pixelArt: true,
    roundPixels: true
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0,x:0 },
      debug: false
    }
  },
  scene: MainScene,
};

export default Game
