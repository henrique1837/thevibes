import {
  THREE,
  FLAT
} from '@enable3d/phaser-extension';
import { getLegacy3BoxProfileAsBasicProfile } from '@ceramicstudio/idx';

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
    this.status = 0;
  }


  update = async (time, delta) => {
    if(!this.provider){
      return;
    }
    if(!this.initOnChainGame && this.ready){
      await this.initiateOnChainGame()
    }
    this.handleControls(time,delta);


    if(this.keys && this.gameContract) {
      if (this.keys.q.isDown && !this.status) {
        this.status = true;
        this.occupy();
      }
    }
  }

  initiateOnChainGame = async () => {
    // Register for events
    this.initOnChainGame = true;
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
    this.gameContract.on(filter,function(uri,requestId,result) {

        console.log(`Event: URI - ${uri} Result - ${result}`);
        if(result === 1){
          this.setGameUri(uri);
        } else {
          this.third.haveSomeFun(10000)
        }
    })

  }

  occupy = async () => {
    try{
      console.log(this.metadata)
      const uri = this.metadata.uri
      const signer = this.provider.getSigner();
      const gameContractWithSigner = this.gameContract.connect(signer);
      const tx = await gameContractWithSigner.requestRandomWords(uri);
      await tx.wait();
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
      let profile = await idx.get('basicProfile',uri);
      if(!profile){
        profile = await getLegacy3BoxProfileAsBasicProfile(uri);
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

  generateGameInfo = async (obj) => {
    // create text texture
    if(this.gameInfo){
      this.gameInfo.destroy();
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
    gameInfo.position.set(2,4,-1)
    gameInfo.scale.set(2,2,2 );
    this.third.physics.add.existing(gameInfo,{
      mass: 100
    })
    this.third.add.existing(gameInfo)
    this.gameInfo = gameInfo


  }

}


export default OnChainScene
