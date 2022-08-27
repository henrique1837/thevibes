import {
  THREE,
  FLAT
} from '@enable3d/phaser-extension';

import makeBlockie from 'ethereum-blockies-base64';


import { ethers } from "ethers";
import  addresses from "./addresses";
import  abis  from "./abis";

import MainScene from "../MainScene3D.js";

let provider;
let idx;

export const setGameProvider = (newProvider,newIDX) => {
  provider = newProvider;
  idx = newIDX;
}

class OnChainScene extends MainScene {
  constructor() {

    super({ key: 'OnChainScene' });
    this.provider = provider;
    this.status = false;
  }


  update = async (time, delta) => {
    if(!this.provider){
      return;
    }


    this.handleControls(time,delta);


    if(this.keys && this.gameContract && this.coinbaseGame) {
      if (this.keys.q.isDown && !this.status) {
        this.status = true;
        this.occupy();
      }
    }
    if(this.messageText && this.player && this.ready){
      const pos = this.player.position;
      this.messageText.position.set(pos.x,pos.y+0.2,pos.z);
    }

    if(!this.initOnChainGame && this.ready){
      await this.initiateOnChainGame()
    }
  }

  initiateOnChainGame = async () => {
    // Register for events
    this.initOnChainGame = true;
    this.setText(`Initiating contract ...`)
    const {chainId} = await provider.getNetwork();
    console.log(chainId)
    if(chainId === 4){
      this.gameContract = new ethers.Contract(addresses.game.rinkeby,abis.game,provider);
    } else if(chainId === 5){
      this.gameContract = new ethers.Contract(addresses.game.goerli,abis.game,provider);
    } else {
      this.gameContract = new ethers.Contract(addresses.game.mumbai,abis.game,provider);
    }
    console.log(this.gameContract)
    const uri = await this.gameContract.uri();
    this.setGameUri(uri);
    const filter = this.gameContract.filters.Result();
    this.gameContract.on(filter,this.handleEvents)
    this.setText(`Contract initiated`);


  }
  handleEvents = (uri,requestId,result) => {

      console.log(`Event: URI - ${uri} Result - ${result}`);
      if(result){
        if(uri === this.metadata.uri){
          this.setText(`Your URI has won the place!`);
        } else {
          this.setText(`Someone won the place ...`);
        }
        this.setGameUri(uri);
      } else {
        let i = 0;
        if(uri === this.metadata.uri){
          this.setText(`You did a terrible mistake ...`);
        } else {
          this.setText(`Be carefull ...`);
        }
        const metorsInterval = setInterval(() => {
          if(i < 20){
            this.meteorsRain();
          } else {
            clearInterval(metorsInterval);
          }
          i = i + 1;
        },2000);

      }
  }
  meteorsRain = () => {
    if(!this.player){
      return
    }
    const pos = this.player.position;
    const sphere = this.third.physics.add.sphere(
      { radius: 1, x: pos.x, y: pos.y+2, z: pos.z, mass: 100, bufferGeometry: true },
      { phong: { color: 0x202020 } }
    );
    const that = this;
    setTimeout(()=>{
      that.third.destroy(sphere);
    },6000);
  }
  occupy = async () => {
    try{
      console.log(this.metadata);
      this.setText(`Sign transaction ...`)
      const uri = this.metadata.uri
      const signer = this.provider.getSigner();
      const gameContractWithSigner = this.gameContract.connect(signer);
      const tx = await gameContractWithSigner.requestRandomWords(uri);
      this.setText(`Tx sent, wait for confirmation ...`);
      await tx.wait();
      this.setText(`Tx confirmed, wait for vrf result ...`)
      this.status = false;
    } catch(err){
      console.log(err);
      this.status = false;
    }
  }

  setGameUri = async (uri) => {
    let obj;
    if(uri.includes("did")){
      // Get profile info from ceramic.network
      const profile = await idx.get('basicProfile',uri);
      if(!profile){
        return
      }
      obj = {
        name: profile.name ? profile.name : uri,
        description: profile.description,
        image: profile.image ?
               profile.image.replace("ipfs://","https://ipfs.io/ipfs/") :
               makeBlockie(uri),
        external_url: profile.url
      }
    } else {
      // Assumes it is nft metadata
      try{
        const metadata = JSON.parse(await (await fetch(`https://ipfs.io/ipfs/${uri}`)).text());
        obj = metadata;
      } catch(err){
        console.log(err)
        return
      }
    }
    await this.generateGameInfo(obj);
  }
  setText = (text) => {
    const pos = this.player.position;
    let texture = new FLAT.TextTexture(text)
    // texture in 3d space
    let sprite3d = new FLAT.TextSprite(texture)
    sprite3d.setScale(0.03)
    const messageText = new THREE.Group();
    messageText.add(sprite3d);
    messageText.position.set(pos.x,pos.y+0.2,pos.z);
    messageText.scale.set(0.03,0.03,0.03);
    this.third.add.existing(messageText);
    this.third.physics.add.existing(messageText);
    this.messageText = messageText;
    const that = this;
    setTimeout(()=>{
      that.third.destroy(messageText);
      that.messageText = null
    },5000);


  }
  generateGameInfo = async (obj) => {
    // create text texture
    if(this.gameInfo){
      this.third.destroy(this.gameInfo);
      this.gameInfo = null
    }
    let texture = new FLAT.TextTexture(obj.name)
    // texture in 3d space
    let sprite3d = new FLAT.TextSprite(texture)
    sprite3d.setScale(0.03)
    const gameInfo = new THREE.Group()
    gameInfo.name =  obj.name
    console.log(obj)
    const img = await this.getPlayerImg(obj);
    const material = new THREE.SpriteMaterial( { map: img } );
    const sprite = new THREE.Sprite( material );
    sprite.position.y = 0.2;
    sprite3d.position.y = 0.8;
    //const body = this.third.add.box({ height: 0.1, y: -0.5, width: 0.4, depth: 0.4 }, { lambert: { color: 0xFF3333 } });
    //body.material.invisible = true;
    //gameInfo.add(body)
    gameInfo.add(sprite)
    gameInfo.add(sprite3d);
    if(obj.description){
      texture = new FLAT.TextTexture(obj.description);
      // texture in 3d space
      sprite3d = new FLAT.TextSprite(texture)
      sprite3d.position.y = 0.4;
      sprite3d.setScale(0.01);
      gameInfo.add(sprite3d);
    }
    gameInfo.position.set(2.5,4,0.5)
    gameInfo.scale.set(2,2,2);
    this.third.physics.add.existing(gameInfo,{
      mass: 100
    })
    this.third.add.existing(gameInfo)
    this.gameInfo = gameInfo


  }

}


export default OnChainScene
