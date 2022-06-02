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
import OrbitDB from 'orbit-db';
import Room from 'ipfs-pubsub-room';


const gameOrbitDB = '/orbitdb/zdpuAoPQbuca6q6zVVZU4AnTvSm1K2TzKbZLift9bzpodux3Z/TheVibes3D Assets';
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
    this.totalPlayers = 0;
    this.peers = [];
    this.otherPlayers = []
    this.friendlyPlayers = [];
    this.info = [];
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
    const room = new Room(this.ipfs, topicMovements);
    room.on('peer joined', (peer) => {
      console.log('Peer joined the room', peer)

    })

    room.on('peer left', (peer) => {
      console.log('Peer left...', peer);
    })

    // now started to listen to room
    room.on('subscribed', () => {
      console.log('Now connected!')
    });
    window.addEventListener('unload', function(event) {
      room.leave();
    });

    room.on('message',this.handleMessages);
    this.room = room;
    //this.third.physics.debug.enable()
    this.images = [];
    await this.prepareScenario()
    await this.generatePlayer();
    this.prepareControls();
    this.ready = true;
    /* Create OrbitDB instance
    OrbitDB.createInstance(ipfs)
    .then(async orbitdb => {
      const db = await orbitdb.keyvalue(gameOrbitDB);
      console.log(`Connected to ${db.address}`);
      const value = db.all
      console.log(Object.keys(value))
      this.db = db;
      db.events.on('replicated', (address) => {
        console.log(`Replicated DB with ${address}`);
        const value = this.db.all
        console.log(value)
      });
      db.events.on('peer', (peer) => {
        console.log(`Connected to ${peer}`);
      });
      db.events.on('write', (address, entry, heads) => {
        console.log(entry)
      } )
    })
    .catch(err => {
      console.log(err)
    })
    */

    window.addEventListener('unload', function(event) {
      this.room.leave();
    });

  }
  generatePlayer = async() => {
    /**
     * Create Player
     */
     // create text texture
     const texture = new FLAT.TextTexture(this.metadata.name);
     // texture in 3d space
     const sprite3d = new FLAT.TextSprite(texture)
     sprite3d.setScale(0.003)

    this.player = new THREE.Group();
    this.player.name = this.metadata.name;
    this.player.metadata = this.metadata;

    const playerImg = await this.getPlayerImg(this.metadata);
    const material = new THREE.SpriteMaterial( { map: playerImg } );
    const sprite = new THREE.Sprite( material );
    //const body = this.third.add.box({ height: 0.1, y: -0.5, width: 0.4, depth: 0.4 }, { lambert: { color: 0xFF3333 } });
    sprite.position.y = 0.2;
    sprite3d.position.y = 0.8;
    this.player.rotateY(Math.PI + 0.1) // a hack
    //this.player.add(body)
    this.player.add(sprite)
    this.player.add(sprite3d)
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
    this.sendMessagePlayerEntered()
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


    // height map from https://i.stack.imgur.com/NvF5e.jpg
    const heightmap = await this.third.load.texture('/assets/heightmap/heightmap.png')
    // Powered by Chroma.js (https://github.com/gka/chroma.js/)
    const colorScale = chroma
      .scale(['#003eb2', '#0952c6', '#a49463', '#867645', '#3c6114', '#5a7f32', '#8c8e7b', '#a0a28f', '#ebebeb'])
      .domain([0,0.1,0.2,0.3,0.4,0.5,0.6,0.8,0.9,1])
    const mesh = this.third.heightMap.add(heightmap,{ colorScale })
    if (mesh) {
      // add custom material or a texture
      //mesh.material = new THREE.MeshPhongMaterial({ map: grass })
      mesh.name = "WorldGround"
      // we position, scale, rotate etc. the mesh before adding physics to it
      mesh.scale.set(2, 2,1)
      mesh.position.set(0,0,0);
      // @ts-ignore
      this.third.physics.add.existing(mesh,{collisionFlags:1});

    }
    /*
    "Low Poly Office Building 1" (https://sketchfab.com/3d-models/low-poly-office-building-1-c4970cbcb82746fb8c107875e789e270#download)
     by Kendy2008
     is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).

    this.renderFBX('/assets/fbx/Office_1.fbx',{x:0.01,y:0.01,z:0.01},{x:-0.5,y:5,z:-1},1)
    this.renderFBX('/assets/fbx/PowerPlant.fbx',{x:0.01,y:0.01,z:0.01},{x:2,y:5,z:2},1);
    this.renderFBX('/assets/fbx/WaterProcessing.fbx',{x:0.01,y:0.01,z:0.01},{x:5.5,y:5,z:2.3},1)

    this.renderFBX('/assets/fbx/Office_3.fbx',{x:0.01,y:0.01,z:0.01},{x:-1,y:5,z:1},1);
    */
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
  mountBase = async (player) => {
    if(this.info[player.metadata.name]){
      this.third.destroy(this.info[player.metadata.name]);
    }
    const image = await this.getPlayerImg(player.metadata);
    const textureCube = this.third.misc.textureCube([image,image,image,image,image,image])
    const body = this.third.add.box({ width: 0.5, height: 1, depth: 0.5 }, { custom: textureCube.materials,mass: 1000 })
    body.position.set(player.position.x,player.position.y+2,player.position.z+2)
    //cube.setScale(0.003)
    this.third.physics.add.existing(body);
    this.third.add.existing(body)
    this.info[player.metadata.name] = body;
    if(this.db){
      this.db.put(this.player.name,{metadata: player.metadata,position:body.position})
    }
    this.third.physics.add.collider(body, this.player, async event => {
      if(this.keys.d.isDown){
        if(player.metadata.external_url){
          const confirm = window.confirm(`Visit ${player.metadata.external_url} ?`)
          if(confirm){
            window.open(player.metadata.external_url,"_blank");
          }
        } else if(player.metadata.name.includes("Guest")){
          const confirm = window.confirm(`Visit https://dweb.link/ipns/thehashavatars.crypto ?`)
          if(confirm){
            window.open("https://dweb.link/ipns/thehashavatars.crypto","_blank");
          }
        }
      }
    });
    return(body);
  }
  getInfo = async (player) => {
    const body = await this.mountBase(player);
    let msgSend = JSON.stringify({
      metadata: this.metadata,
      contractAddress: this.contractAddress,
      player: this.player,
      position: body.body.position,
      velocity: body.body.velocity,
      from: this.coinbaseGame,
      type: "base"
    });
    this.sendMessage(topicMovements,msgSend);
  }

  shoot = () => {

    const raycaster = new THREE.Raycaster()
    const x = 0
    const y = 0
    const force = 5
    const pos = new THREE.Vector3()

    raycaster.setFromCamera({ x, y }, this.third.camera)

    pos.copy(raycaster.ray.direction)
    pos.add(raycaster.ray.origin)

    const sphere = this.third.physics.add.sphere(
      { radius: 0.025, x: pos.x, y: pos.y - 0.01, z: pos.z, mass: 10, bufferGeometry: true },
      { phong: { color: 0x202020 } }
    )

    pos.copy(raycaster.ray.direction)
    pos.multiplyScalar(24)

    //sphere.body.applyForce(pos.x * force, pos.y * force, pos.z * force);
    sphere.body.on.collision((otherObject, event) => {
      if (otherObject.name !== 'ground')
      if(otherObject.name === this.player.name){
        this.third.physics.destroy(this.player)
        this.player.position.set(2, 3, -1)
        this.third.destroy(sphere);
        this.third.physics.add.existing(this.player)

      }
    })
    let msgSend = JSON.stringify({
      metadata: this.metadata,
      contractAddress: this.contractAddress,
      player: this.player,
      position: sphere.body.position,
      velocity: sphere.body.velocity,
      from: this.coinbaseGame,
      type: "shoot"
    });
    this.sendMessage(topicMovements,msgSend);
    setTimeout(() => {
      this.third.destroy(sphere);
    },2000)
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


      if((this.keys.w.isDown || this.move ) && Math.round(this.time.now) % 5 === 0){ //&& !this.movementInit){
        this.sendMessage(topicMovements,msg)
        this.movementInit = true
      }
      /*
      if(!(this.keys.w.isDown || this.move ) && this.movementInit){
        this.sendMessage(topicMovements,msg)
        this.movementInit = false
      }
      */
      if(this.isJumping && Math.round(this.time.now) % 5 === 0){
        this.sendMessage(topicMovements,msg)
      }
      if(Math.round(this.time.now) % 10 === 0){
        this.sendMessage(topicMovements,msg)
      }
      const raycaster = new THREE.Raycaster()

      // shoot
      if (this.keys.f.isDown) {
        this.shoot();
      }
      // mount base
      if (this.keys.a.isDown) {
        this.getInfo(this.player);
        //this.shoot();
      }
    }
  }
  sendMessage = async (topic,msg) => {

    //const msgSend = new TextEncoder().encode(msg)
    await this.room.broadcast(msg)
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
    this.sendMessage(topicMovements,msg);

    msg = JSON.stringify({
      metadata: this.metadata,
      contractAddress: this.contractAddress,
      player: this.player,
      velocity: this.player.body.velocity,
      position: this.player.body.position,
      from: this.coinbaseGame,
      type: "movement"
    });
    this.sendMessage(topicMovements,msg);

  }
  addOtherPlayer = async (obj) => {
    // create text texture
    const texture = new FLAT.TextTexture(obj.metadata.name)
    // texture in 3d space
    const sprite3d = new FLAT.TextSprite(texture)
    sprite3d.setScale(0.003)
    const otherPlayer = new THREE.Group()
    otherPlayer.name =  obj.metadata.name
    otherPlayer.contractAddress = obj.contractAddress;
    otherPlayer.metadata = obj.metadata;
    const playerImg = await this.getPlayerImg(obj.metadata);
    const material = new THREE.SpriteMaterial( { map: playerImg } );
    const sprite = new THREE.Sprite( material );
    sprite.position.y = 0.2;
    sprite3d.position.y = 0.8;
    //const body = this.third.add.box({ height: 0.1, y: -0.5, width: 0.4, depth: 0.4 }, { lambert: { color: 0xFF3333 } });
    //body.material.invisible = true;
    //otherPlayer.add(body)
    otherPlayer.add(sprite)
    otherPlayer.add(sprite3d);
    otherPlayer.position.set(2,3,-1)
    otherPlayer.scale.set(0.1,0.1,0.1)
    this.third.add.existing(otherPlayer)


    //this.third.physics.add.existing(otherPlayer)









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
    this.sendMessage(topicMovements,msgSend);
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
      //console.log(new TextDecoder().decode(msg.data))
      //console.log(msg)

      const obj = JSON.parse(new TextDecoder().decode(msg.data));
      //const obj = JSON.parse(msg);
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
      if(obj.type === "shoot"){
        if(obj.metadata.name !== this.player.name){
          const sphere = this.third.physics.add.sphere(
            { radius: 0.025, x: obj.position.x, y: obj.position.y, z: obj.position.z, mass: 5, bufferGeometry: true },
            { phong: { color: 0x202020 } }
          );
          const force = 5;
          //sphere.body.applyForce(obj.position.x * force, obj.position.y * force, obj.position.z * force);
          setTimeout(() => {
            this.third.destroy(sphere);
          },2000)
          sphere.body.on.collision((otherObject, event) => {
            if (otherObject.name !== 'ground')
            if(otherObject.name === this.player.name){
              this.third.physics.destroy(this.player)

              this.player.position.set(2, 3, -1);
              this.third.destroy(sphere);
              this.third.physics.add.existing(this.player)


            }
          })
        }
      }
      if(obj.type === "base"){
        this.mountBase(obj);
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
