import chroma from "chroma-js";
import {
  Scene3D,
  THREE,
  FLAT,
  JoyStick,
  ThirdPersonControls,
  PointerLock,
  PointerDrag
} from '@enable3d/phaser-extension';


let topicMovements = 'hash-avatars/games/first-contact/movements';

let metadata;
let coinbaseGame;
let contractAddress;
let ipfs;
let textInput;
let mapHash = "bafybeiflup6dpz7wcqdi5k7u43pb722ietk3tlr2iknip635p3r4gg2sie";
let mapTiles = "bafkreier6xkncx24wj4wm7td3v2k3ea2r2gpfg2qamtvh7digt27mmyqkm";

let mapName = "!CL_DEMO_32x32";

export const setAttributes = (mt,cG,cA,r,mH,mN,tM,mT) => {
  metadata = mt
  coinbaseGame = cG;
  contractAddress = cA;
  ipfs = r;
  if(mH){
    mapHash = mH;
  }
  if(mN){
    mapName = mN;
  }
  if(tM){
    topicMovements = tM;
  }
  if(mT){
    mapTiles = mT;
  }
}

export const setTextInput = (tI) => {
  textInput = tI;
}

/**
 * Is touch device?
 */
const isTouchDevice = 'ontouchstart' in window

class MainScene extends Scene3D {
  constructor() {
    super({ key: 'MainScene' })
    this.metadata = metadata;
    this.ipfs = ipfs;
    this.coinbaseGame = coinbaseGame;
    this.contractAddress = contractAddress;

    this.otherPlayers = []
    this.friendlyPlayers = [];

  }

  preload = async () => {

    window.scrollTo(0, document.body.scrollHeight);

  }

  init = async () => {
    this.accessThirdDimension({ maxSubSteps: 100, fixedTimeStep: 1 / 180 })
    this.canJump = true
    this.isJumping = false
    this.move = false

    this.moveTop = 0
    this.moveRight = 0;
  }

  create = async () => {
    const {orbitControls} = this.third.warpSpeed('camera', 'sky', 'grid', 'ground', 'light');
    this.orbitControls = orbitControls;



    this.ipfs.pubsub.subscribe(topicMovements,this.handleMessages);
    //this.third.physics.debug.enable()
    this.images = [];
    await this.prepareScenario()
    await this.generatePlayer();
    /*
      "Fantasy Town" (https://sketchfab.com/3d-models/fantasy-town-0db322fa7a614975b83753a37c4e7350)
      by Eh is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).
    */




    this.prepareControls();
    this.ready = true;
  }
  generatePlayer = async() => {
    /**
     * Create Player
     */

    this.player = new THREE.Group();
    this.player.name = this.metadata.name;
    const playerImg = await this.getPlayerImg(this.metadata);
    const material = new THREE.SpriteMaterial( { map: playerImg } );
    const sprite = new THREE.Sprite( material );
    sprite.position.y = 0.2;
    this.player.rotateY(Math.PI + 0.1) // a hack
    this.player.add(sprite)
    this.player.position.set(2, 3, -1)
    this.player.scale.set(0.1,0.1,0.1);


    /**
     * Add the player to the scene with a body
     */
    this.third.physics.add.existing(this.player,{shape:"box"})
    this.third.add.existing(this.player);
    this.player.body.setFriction(0.8)
    this.player.body.setAngularFactor(0, 0, 0)

    // Adaptation for ColorGhosts
    this.player.nftVelocity = 0;
    if(this.metadata.attributes){
      this.metadata.attributes.map(item => {
        if(item.trait_type.toLowerCase() === "velocity"){
          this.player.nftVelocity = Number(item.value)
        }
        return(item)
      })
    }



    /**
     * Add 3rd Person Controls
     */
    this.controls = new ThirdPersonControls(this.third.camera, this.player, {
      offset: new THREE.Vector3(0, 0.2, 0),
      targetRadius: 0.5
    });
    await this.sendMessagePlayerEntered()
    window.addEventListener( 'resize', this.onWindowResize );

  }
  prepareScenario = async () => {

    /**
     * Create bridge and vibeslywood
     */
     //const bridge = this.generateFromSVG('bridge',{x: 3,y:1,z: 4},50,120);
     //const vibeslywood = this.generateFromSVG('vibeslywood',{x:12,y:15,z: -100},20,2);
     //vibeslywood.rotation.set(10)
    // Create water


    const textures = await Promise.all([
      this.third.load.texture('/assets/water/Water_1_M_Normal.jpg'),
      this.third.load.texture('/assets/water/Water_2_M_Normal.jpg')
    ])
    textures[0].needsUpdate = true
    textures[1].needsUpdate = true
    this.third.misc.water({
      y: 0.05,
      normalMap0: textures[0],
      normalMap1: textures[1]
    })


    // height map from https://tangrams.github.io/heightmapper/#1.11667/21.3/478.2
    const heightmap = await this.third.load.texture('/assets/heightmap/heightmap.png')
    // Powered by Chroma.js (https://github.com/gka/chroma.js/)
    const colorScale = chroma
      .scale(['#003eb2', '#0952c6', '#a49463', '#867645', '#3c6114', '#5a7f32', '#8c8e7b', '#a0a28f', '#ebebeb'])
      .domain([0,0.1,0.2,0.3,0.4,0.5,0.6,0.8,0.9,1])
    const mesh = this.third.heightMap.add(heightmap,{ colorScale })
    if (mesh) {
      // add custom material or a texture
      //mesh.material = new THREE.MeshPhongMaterial({ map: grass })

      // we position, scale, rotate etc. the mesh before adding physics to it
      mesh.scale.set(2, 2,1)
      mesh.position.set(0,0,0)
      // @ts-ignore
      this.third.physics.add.existing(mesh,{collisionFlags:1});

    }
    /*
    "Low Poly Office Building 1" (https://sketchfab.com/3d-models/low-poly-office-building-1-c4970cbcb82746fb8c107875e789e270#download)
     by Kendy2008
     is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).
    */
    this.renderFBX('/assets/fbx/Office_1.fbx',{x:0.01,y:0.01,z:0.01},{x:-0.5,y:5,z:-1},1)
    this.renderFBX('/assets/fbx/PowerPlant.fbx',{x:0.01,y:0.01,z:0.01},{x:2,y:5,z:2},1);
    this.renderFBX('/assets/fbx/WaterProcessing.fbx',{x:0.01,y:0.01,z:0.01},{x:5.5,y:5,z:2.3},1)

    this.renderFBX('/assets/fbx/Office_3.fbx',{x:0.01,y:0.01,z:0.01},{x:-1,y:5,z:1},1);
    /*
    https://godgoldfear.itch.io/low-poly-trees

    this.renderFBX('/assets/fbx/tree/Tree1.fbx',{x:0.06,y:0.06,z:0.06},{x:-4,y:5,z:-1},1)
    this.renderFBX('/assets/fbx/tree/Tree2.fbx',{x:0.06,y:0.06,z:0.06},{x:-2,y:5,z:-4},1)
    this.renderFBX('/assets/fbx/tree/Tree3.fbx',{x:0.06,y:0.06,z:0.06},{x:-2,y:5,z:-2},1)
    this.renderFBX('/assets/fbx/tree/Tree4.fbx',{x:0.06,y:0.06,z:0.06},{x:0,y:5,z:-3},1)
    this.renderFBX('/assets/fbx/tree/Tree5.fbx',{x:0.06,y:0.06,z:0.06},{x:-1,y:5,z:-1},1)
    */

  }

  renderFBX = async (file,scale,pos,max) => {
    const object = await this.third.load.fbx(file)
    for(let i=0;i<max;i++){
      const house = new THREE.Group()
      house.rotateY(Math.PI + 0.1) // a hack
      house.add(object)
      house.scale.set(scale.x,scale.y,scale.z)
      house.position.set(pos.x+(i*5),pos.y,pos.z+(i*3));

      this.third.physics.add.existing(house,{
        shape: 'box',
        width:50,
        mass:100
      })
      this.third.add.existing(house)

      house.body.setFriction(1)
      house.body.setAngularFactor(0, 0, 0)
    }
  }
  prepareControls = () => {

    /**
     * Add Keys
     */
    this.keys = {
      a: this.input.keyboard.addKey('a'),
      w: this.input.keyboard.addKey('w'),
      d: this.input.keyboard.addKey('d'),
      s: this.input.keyboard.addKey('s'),
      f: this.input.keyboard.addKey('f'),
      space: this.input.keyboard.addKey(32)
    }

    /**
     * PointerLock and PointerDrag
     */
    if (!isTouchDevice) {
      const pointerLock = new PointerLock(this.game.canvas)
      const pointerDrag = new PointerDrag(this.game.canvas)
      pointerDrag.onMove(delta => {
        if (!pointerLock.isLocked()) return
        const { x, y } = delta
        this.moveTop = -y
        this.moveRight = x
      })
    }
    /**
     * Add joystick
     */
    if (isTouchDevice) {
      const joystick = new JoyStick()
      const axis = joystick.add.axis({
        styles: { left: 35, bottom: 35, size: 100 }
      })
      axis.onMove(event => {
        /**
         * Update Camera
         */
        const { top, right } = event
        this.moveTop = top * 3
        this.moveRight = right * 3
      })
      const buttonA = joystick.add.button({
        letter: 'A',
        styles: { right: 35, bottom: 110, size: 80 }
      })
      buttonA.onClick(() => this.jump())
      const buttonB = joystick.add.button({
        letter: 'B',
        styles: { right: 110, bottom: 35, size: 80 }
      })
      buttonB.onClick(() => (this.move = true))
      buttonB.onRelease(() => (this.move = false))
    }
  }
  generateFromSVG = (name,pos,scale,depth) => {
    const svg = this.cache.html.get(name)
    const bridgeShape = this.third.transform.fromSVGtoShape(svg)
    const bridge = this.third.add.extrude({
      shape: bridgeShape[0],
      depth: depth
    })
    bridge.scale.set(1 / scale, 1 / -scale, 1 / scale)
    bridge.shape = 'concave'
    bridge.position.setX(pos.x);
    bridge.position.setZ(pos.z);
    bridge.position.setY(pos.y)
    this.third.physics.add.existing(bridge)

    bridge.body.setAngularFactor(0, 0, 0)
    bridge.body.setLinearFactor(0, 0, 0)
    bridge.body.setFriction(0.8)
    return(bridge)
  }
  jump = () => {
    if (!this.player) return
    this.canJump = false
    this.isJumping = true
    this.time.addEvent({
      delay: 750,
      callback: () => (this.canJump = true)
    })
    this.time.addEvent({
      delay: 750,
      callback: () => {
        this.isJumping = false
      }
    })
    this.player.body.applyForceY(4)
  }
  getInfo = async (player) => {
    // Initialize the flat elements
    this.ui = FLAT.init(this.renderer)
    const orbitControls = this.orbitControls;
    // Use this if you need events on the 2D elements.
    // If you are using orbitControls, pass it to initEvents().
    // This makes sure orbitControls is not messing with the mouse move.
    //FLAT.initEvents({ canvas: this.renderer.domElement, orbitControls })

    // Call Flat.destroy() on scene restart or stop
    // or simply add FLAT to the deconstructor
    this.deconstructor.add(FLAT /* same effect as FLAT.destroy */, orbitControls)

    // create text texture
    let texture = new FLAT.TextTexture(`Name: ${player.name}`);
    // texture in 3d space
    let sprite3d = new FLAT.TextSprite(texture)
    this.scene.add(sprite3d)
    sprite3d.position.set(player.position.x+2,player.position.y+4,player.position.z)
  }
  update = (time, delta) => {
    if(!this.ready){
      return
    }
    if (this.player && this.player.body && this.controls && this.controls.update) {
      /**
       * Update Controls
       */
      this.controls.update(this.moveRight * 3, -this.moveTop * 3)
      if (!isTouchDevice) this.moveRight = this.moveTop = 0
      /**
       * Player Turn
       */
      const speed = 1 + this.player.nftVelocity/200
      const v3 = new THREE.Vector3()

      const rotation = this.third.camera.getWorldDirection(v3)
      const theta = Math.atan2(rotation.x, rotation.z)
      const rotationMan = this.player.getWorldDirection(v3)
      const thetaMan = Math.atan2(rotationMan.x, rotationMan.z)
      this.player.body.setAngularVelocityY(0)

      const l = Math.abs(theta - thetaMan)
      let rotationSpeed = isTouchDevice ? 2 : 4
      let d = Math.PI / 24

      if (l > d) {
        if (l > Math.PI - d) rotationSpeed *= -1
        if (theta < thetaMan) rotationSpeed *= -1
        this.player.body.setAngularVelocityY(rotationSpeed)
      }

      /**
       * Player Move
       */
      if (this.keys.w.isDown || this.move) {
        const x = Math.sin(theta) * speed,
          y = this.player.body.velocity.y,
          z = Math.cos(theta) * speed

        this.player.body.setVelocity(x, y, z)
      }

      /**
       * Player Jump
       */
      if (this.keys.space.isDown && this.canJump) {
        this.jump()
      }



      const obj = {
        metadata: this.metadata,
        player: this.player,
        contractAddress: this.contractAddress,
        position: this.player.position,
        velocity: this.player.velocity,
        from: this.coinbaseGame,
        type: "movement"
      };
      const msg = JSON.stringify(obj);


      if((this.keys.w.isDown || this.move ) && Math.round(this.time.now) % 10){ //&& !this.movementInit){
        this.sendMessage(topicMovements,msg)
        this.movementInit = true
      }
      /*
      if(!(this.keys.w.isDown || this.move ) && this.movementInit){
        this.sendMessage(topicMovements,msg)
        this.movementInit = false
      }
      */
      if(this.isJumping && Math.round(this.time.now) % 10 === 0){
        this.sendMessage(topicMovements,msg)
      }
      if(Math.round(this.time.now) % 100 === 0){
        this.sendMessage(topicMovements,msg)
      }
    }
  }
  sendMessage = async (topic,msg) => {

    const msgSend = new TextEncoder().encode(msg)
    await this.ipfs.pubsub.publish(topic, msgSend)
  }
  sendMessagePlayerEntered = async () => {
    let msg = JSON.stringify({
      message: `Connected`,
      from: this.coinbaseGame,
      contractAddress: this.contractAddress,
      timestamp: (new Date()).getTime(),
      metadata: this.metadata,
      type: "message"
    });
    await this.sendMessage(topicMovements,msg);


    msg = JSON.stringify({
      metadata: this.metadata,
      contractAddress: this.contractAddress,
      player: this.player,
      velocity: this.player.body.velocity,
      position: this.player.body.position,
      from: this.coinbaseGame,
      type: "movement"
    });
    await this.sendMessage(topicMovements,msg);

  }
  addOtherPlayer = async (obj) => {
    const otherPlayer = new THREE.Group()
    otherPlayer.name =  obj.metadata.name
    otherPlayer.contractAddress = obj.contractAddress;
    otherPlayer.metadata = obj.metadata;
    const playerImg = await this.getPlayerImg(obj.metadata);
    const material = new THREE.SpriteMaterial( { map: playerImg } );
    const sprite = new THREE.Sprite( material );
    sprite.position.y = 0.2;
    const body = this.third.add.box({ height: 0.1, y: 0, width: 0.4, depth: 0.4 }, { lambert: { color: 0xFF3333 } });
    //body.material.invisible = true;
    otherPlayer.add(body)
    otherPlayer.add(sprite)
    otherPlayer.position.set(2,3,-1)
    otherPlayer.scale.set(0.1,0.1,0.1)
    this.third.add.existing(otherPlayer)


    //this.third.physics.add.existing(otherPlayer)


    this.third.physics.add.collider(otherPlayer, this.player, async event => {
      console.log(`${event}`);
      if(this.keys.f.isDown){
        await this.getInfo(otherPlayer);
      }
    });






    if(obj.contractAddress !== this.contractAddress){
      this.otherPlayers.push(otherPlayer);
    } else {
      this.friendlyPlayers.push(otherPlayer);
    }
    let msgSend = JSON.stringify({
      metadata: this.metadata,
      contractAddress: this.contractAddress,
      player: this.player,
      position: this.player.body.position,
      velocity: this.player.body.velocity,
      from: this.coinbaseGame,
      type: "movement"
    });
    await this.sendMessage(topicMovements,msgSend);
  }
  getPlayerImg = async (metadata) => {
    let playerImg;
    if(!this.guestTextures){
      this.guestTextures = await Promise.all([
        this.third.load.texture("https://ipfs.io/ipfs/QmeVRmVLPqUNZUKERq14uXPYbyRoUN7UE8Sha2Q4rT6oyF"),
        this.third.load.texture("https://ipfs.io/ipfs/bafybeifkniqdd5nkouwbswhyatrrnx7dv46imnkez4ocxbfsigeijxagsy")
      ])
    }
    if(!metadata.name.includes("Guest")){
      let url;
      if(metadata.image_data){
        let image_data;
        if(metadata.image_data.includes("data:image/svg+xml;base64,")){
          image_data = atob(metadata.image_data.replace("data:image/svg+xml;base64,",""));
        } else {
          image_data = metadata.image_data.replace("data:image/svg+xml;utf8,","");
        }
        const blob = new Blob([image_data], { type: 'image/svg+xml' });
        url = URL.createObjectURL(blob);
      } else {
        url = metadata.image.replace("ipfs://","https://ipfs.io/ipfs/")
      }
      playerImg = await this.third.load.texture(url);
    } else {
      if(metadata.image.includes("QmeVRmVLPqUNZUKERq14uXPYbyRoUN7UE8Sha2Q4rT6oyF")){
        playerImg = this.guestTextures[0]
      } else {
        playerImg = this.guestTextures[1];
      }
    }
    return(playerImg);
  }
  handleMessages = async (msg) => {
    try{
      const obj = JSON.parse(new TextDecoder().decode(msg.data));
      if(!obj.metadata){
        return
      }
      if(obj.type === "movement" && obj.metadata.name !== this.player.name){

        let added = false;
        this.otherPlayers.forEach(function (otherPlayer) {

          if (obj.metadata.name === otherPlayer.name && obj.contractAddress === otherPlayer.contractAddress) {

            otherPlayer.position.set(obj.position.x,obj.position.y,obj.position.z)
            /*
            otherPlayer.velocity.set(obj.velocity.x,obj.velocity.y,obj.velocity.z)
            if(obj.velocity.x === 0 && obj.velocity.y === 0 && obj.velocity.z === 0 ){
              otherPlayer.position.set(obj.position.x,obj.postion.y,obj.position.z)
            }
            */
            added = true;
          }
        });
        this.friendlyPlayers.forEach(function (otherPlayer) {

          if (obj.metadata.name === otherPlayer.name && obj.contractAddress === otherPlayer.contractAddress) {

            otherPlayer.position.set(obj.position.x,obj.position.y,obj.position.z)


            added = true;

          }
        });
        if(!added){
          await this.addOtherPlayer(obj);
          console.log(`Player ${obj.metadata.name} ${obj.metadata.description} joined`)
        }
      }

      /*
      if(obj.type === "collision"){
        if(obj.name === this.metadata.name){
          this.player.setPosition(
            Phaser.Math.Between(this.map.widthInPixels/2, this.map.widthInPixels/3),
            Phaser.Math.Between(this.map.heightInPixels/2, this.map.heightInPixels/3)
          );
          const str = JSON.stringify({
            message: `${this.metadata.name} died!`,
            from: this.coinbaseGame,
            timestamp: (new Date()).getTime(),
            metadata: this.metadata,
            type: "message"
          });
          this.sendMessage(topicMovements,str);
        }
      }
      if(obj.type === "message"){
        this.chatMessages.push(`${obj.metadata.name}: ${obj.message}`);
        if(this.chatMessages.length > 11) {
            this.chatMessages.shift();
        }
        this.chat.setText(this.chatMessages);

      }
      */

    } catch(err){
      console.log(err)
    }
  }
  onWindowResize = () => {

    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize( window.innerWidth, window.innerHeight );

  }
}


export default MainScene
