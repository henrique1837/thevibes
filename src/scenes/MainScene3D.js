import chroma from "chroma-js";
import {
  Scene3D,
  ExtendedObject3D,
  THREE,
  FLAT,
  JoyStick,
  ThirdPersonControls,
  PointerLock,
  PointerDrag
} from '@enable3d/phaser-extension';
//import OrbitDB from 'orbit-db';
import Room from 'ipfs-pubsub-room';


const gameOrbitDB = '/orbitdb/zdpuB2NzfJc6kHd6dJikZYzXx3PMvxYTsRKAHvqN9mFMsEpVP/test';
let topicMovements = 'hash-avatars/games/first-contact/movements';

let metadata;
let metadatas;
let coinbaseGame;
let contractAddress;
let ipfs;
let textInput;
let mapHash;
let scale = 1;

export const setAttributes = (mt,mts,cG,cA,r,mH,tM,sC) => {
  metadata = mt
  metadatas = mts;
  coinbaseGame = cG;
  contractAddress = cA;
  ipfs = r;
  if(mH){
    mapHash = mH;
  }
  if(tM){
    topicMovements = tM;
  }
  if(sC){
    scale = sC;
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
    this.myNfts = metadatas.filter(mt => {
      if(!mt){
        return
      }
      return(mt.address === contractAddress && mt.metadata.name !== metadata.name);
    });
    this.info = [];
    this.armies = [];
  }

  preload = async () => {

    window.scrollTo(0, document.body.scrollHeight);

  }

  init = async () => {
    this.accessThirdDimension({ maxSubSteps: 100, fixedTimeStep: 1 / 180 })
    this.canJump = true
    this.canShoot = true;
    this.isJumping = false
    this.move = false

    this.moveTop = 0
    this.moveRight = 0;
  }

  create = async () => {
    const {orbitControls} = this.third.warpSpeed('camera', 'sky', '-grid', '-ground', 'light');
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

    this.room = room;
    //this.third.physics.debug.enable()
    this.images = [];
    await this.prepareScenario();
    await this.generatePlayer();
    this.prepareControls();
    room.on('message',this.handleMessages);
    this.ready = true;
    /* Create OrbitDB instance -> Change for js-waku storage nodes
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
    this.player.add(sprite);
    this.player.add(sprite3d);
    this.player.position.set(2, 4, -1)
    this.player.scale.set(0.1,0.1,0.1);
    this.playerImg = playerImg;

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
    this.sendMessagePlayerEntered();
    if(this.myNfts.length > 0){
      const msgSend = JSON.stringify({
        metadata: this.metadata,
        contractAddress: this.contractAddress,
        player: this.player,
        velocity: this.player.body.velocity,
        position: this.player.body.position,
        from: this.coinbaseGame,
        myNfts: this.myNfts,
        type: "army"
      });
      this.sendMessage(topicMovements,msgSend);
    }
    window.addEventListener( 'resize', this.onWindowResize );

  }
  generatePlayersArmy = async(obj) => {
    // Add player's army
    if(!obj.myNfts){
      return
    }
    const army = [];
    for(let nft of obj.myNfts){
      if(!nft.metadata){
        continue
      }
      if(nft.address !== obj.contractAddress){
        continue;
      }
      const nftImg = await this.getPlayerImg(nft.metadata);
      if(!nftImg){
        continue
      }
      const material = new THREE.SpriteMaterial( { map: nftImg } );
      const sprite = new THREE.Sprite( material );
      sprite.position.y = 0.2;
      sprite.scale.set(0.1,0.1,0.1);
      const pos = obj.position;
      sprite.position.set(pos.x,pos.y+1,pos.z);
      sprite.name = nft.metadata.name;
      this.third.physics.add.existing(sprite);
      this.third.add.existing(sprite);
      army.push(sprite)
    }
    this.armies[obj.metadata.name] = army;
    console.log(this.armies[obj.metadata.name])
  }
  prepareScenario = async () => {
    const object =  await this.third.load.gltf(`https://nftstorage.link/ipfs/${mapHash}/gltf/scene.gltf`);
    const scene = object.scenes[0]

    const book = new ExtendedObject3D()
    book.name = 'scene'
    book.add(scene)
    book.scale.set(scale,scale,scale)
    this.third.add.existing(book)

    // add animations
    // sadly only the flags animations works
    object.animations.forEach((anim, i) => {
      book.mixer = this.third.animationMixers.create(book)
      // overwrite the action to be an array of actions
      book.action = []
      book.action[i] = book.mixer.clipAction(anim)
      book.action[i].play()
    })

    book.traverse(child => {
      if (child.isMesh) {
        child.castShadow = child.receiveShadow = false
        child.material.metalness = 0
        child.material.roughness = 1
        this.third.physics.add.existing(child, {
          shape: 'concave',
          mass: 0,
          collisionFlags: 1,
          autoCenter: false
        })
        child.body.setAngularFactor(0, 0, 0)
        child.body.setLinearFactor(0, 0, 0)
      }
    })
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
      s: this.input.keyboard.addKey('s'),
      space: this.input.keyboard.addKey(32),
      enter: this.input.keyboard.addKey(13)
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
  mountBase = async (obj) => {
    if(!obj.metadata){
      return
    }
    if(!obj.metadata.name){
      return
    }

    if(this.info[obj.metadata.name]){
      this.third.destroy(this.info[obj.metadata.name]);
      this.info[obj.metadata.name] = undefined;
    }


    // create text texture
    let text = `${obj.metadata.name} base demo`;
    let texture = new FLAT.TextTexture(`${text}`,{color: "black"});

    // texture in 3d space
    let sprite3d = new FLAT.TextSprite(texture)
    sprite3d.position.y = 0.5;
    sprite3d.setScale(0.001);
    let image;
    if(obj.metadata.name === this.player.name){
      image = this.playerImg;
    } else {
      image = await this.getPlayerImg(obj.metadata);
    }
    const textureCube = this.third.misc.textureCube([image,image,image,image,image,image])
    const body = this.third.add.box({
      width: 0.5,
      height: 0.15,
      depth: 0.5
    }, {
      custom: textureCube.materials,
      mass: 10000
    });
    body.add(sprite3d);
    if(obj.metadata.description){
      text = `${obj.metadata.description}`;
      texture = new FLAT.TextTexture(`${text}`);

      // texture in 3d space
      sprite3d = new FLAT.TextSprite(texture)
      sprite3d.position.y = 0.4;
      sprite3d.setScale(0.001);
      body.add(sprite3d);
    }
    body.position.set(obj.position.x,obj.position.y+2,obj.position.z)
    this.third.physics.add.existing(body);
    this.third.add.existing(body)
    this.info[obj.metadata.name] = body;
    this.third.physics.add.collider(body, this.player, async event => {
      if(this.keys.d.isDown){
        if(obj.metadata.external_url){
          const confirm = window.confirm(`Visit ${obj.metadata.external_url} ?`)
          if(confirm){
            window.open(obj.metadata.external_url,"_blank");
          }
        } else if(obj.metadata.name.includes("Guest")){
          const confirm = window.confirm(`Visit https://dweb.link/ipns/thehashavatars.crypto ?`)
          if(confirm){
            window.open("https://dweb.link/ipns/thehashavatars.crypto","_blank");
          }
        }
      }
    });
  }
  getInfo = async (player) => {
    //const body = await this.mountBase(player);
    let msgSend = JSON.stringify({
      metadata: this.metadata,
      contractAddress: this.contractAddress,
      player: this.player,
      position: {x: player.position.x,y: player.position.y+2,z: player.position.z+2},
      type: "base"
    });
    this.sendMessage(topicMovements,msgSend);
  }

  shoot = () => {

    const raycaster = new THREE.Raycaster()
    const x = 0
    const y = 0
    const pos = new THREE.Vector3();

    raycaster.setFromCamera({ x, y}, this.third.camera);


    let msgSend = JSON.stringify({
      metadata: this.metadata,
      contractAddress: this.contractAddress,
      player: this.player,
      direction: raycaster.ray.direction,
      origin: raycaster.ray.origin,
      from: this.coinbaseGame,
      type: "shoot"
    });
    this.sendMessage(topicMovements,msgSend);
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

        this.player.body.setVelocity(x, y, z);
        if(this.armies[this.metadata.name]){
          this.armies[this.metadata.name].map(nft => {
            nft.body.setVelocity(x,y,z)
          })
        }

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
        myNfts: this.myNfts,
        army: this.armies[this.metadata.name]?.map(unit => {
          return({
            name: unit.name,
            position: unit.position
          })
        }),
        from: this.coinbaseGame,
        type: "movement"
      };
      const msg = JSON.stringify(obj);


      if((this.move || this.isJumping ) && Math.round(this.time.now) % 2 === 0){ //&& !this.movementInit){
        this.sendMessage(topicMovements,msg)
        this.movementInit = true
      }
      if(Math.round(this.time.now) % 100 === 0){
        this.sendMessage(topicMovements,msg)
      }
      const raycaster = new THREE.Raycaster()

      // shoot
      if (this.keys.f.isDown && this.canShoot) {
        this.canShoot = false;
        this.shoot();
        setTimeout(() => {
          this.canShoot = true;
        },1000)
      }
      // mount base
      if (this.keys.a.isDown) {
        this.getInfo(this.player);
      }
      if (this.keys.s.isDown && this.armies[this.metadata.name]) {
        this.armies[this.metadata.name].map(nft => {
          this.third.physics.destroy(nft)
          const pos = this.player.position.clone();
          nft.position.set(pos.x,pos.y+1,pos.z);
          this.third.physics.add.existing(nft);
        })
      }
      if(this.player.position.y < - 10){
        this.third.physics.destroy(this.player)
        if(this.info[this.player.metadata.name]){
          const base = this.info[this.player.metadata.name];
          const pos = base.position.clone();
          this.player.position.set(pos.x,pos.y+2,pos.z);

        } else {
          this.player.position.set(2, 4, -1);
        }
        this.third.physics.add.existing(this.player);

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
      position: this.player.body.position,
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
    otherPlayer.position.set(2,4,-1)
    otherPlayer.scale.set(0.1,0.1,0.1)
    this.third.add.existing(otherPlayer)
    this.third.physics.add.existing(otherPlayer,{
      mass: 0,
      collisionFlags: 1
    })








    this.otherPlayers.push(otherPlayer);
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
    if(this.myNfts.length > 0){
      msgSend = JSON.stringify({
        metadata: this.metadata,
        contractAddress: this.contractAddress,
        player: this.player,
        velocity: this.player.body.velocity,
        position: this.player.body.position,
        from: this.coinbaseGame,
        myNfts: this.myNfts,
        type: "army"
      });
      this.sendMessage(topicMovements,msgSend);
    }

    return(otherPlayer);
  }
  getPlayerImg = async (metadata) => {
    let playerImg;
    if(!this.guestTextures){
      this.guestTextures = await Promise.all([
        this.third.load.texture("https://nftstorage.link/ipfs/QmeVRmVLPqUNZUKERq14uXPYbyRoUN7UE8Sha2Q4rT6oyF"),
        this.third.load.texture("https://nftstorage.link/ipfs/bafybeifkniqdd5nkouwbswhyatrrnx7dv46imnkez4ocxbfsigeijxagsy")
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
        if(metadata.image.includes("ipfs://ipfs/")){
          url = metadata.image.replace("ipfs://ipfs/","https://ipfs.io/ipfs/");
        } else {
          url = metadata.image.replace("ipfs://","https://ipfs.io/ipfs/")
        }
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
      const third = this.third;
      const armies = this.armies
      if(obj.type === "movement" && obj.metadata.name !== metadata.name){

        let added = false;
        this.otherPlayers.forEach(function (otherPlayer) {

          if (obj.metadata.name === otherPlayer.name && obj.contractAddress === otherPlayer.contractAddress) {
            third.physics.destroy(otherPlayer);
            otherPlayer.position.set(obj.position.x,obj.position.y,obj.position.z);
            third.physics.add.existing(otherPlayer,{
              mass: 0,
              collisionFlags: 1
            });
            if(armies[obj.metadata.name] && obj.myNfts && obj.army){
              armies[obj.metadata.name].map(nft => {
                obj.army.map(unit => {
                  if(unit.name === nft.name){
                    third.physics.destroy(nft);
                    nft.position.set(unit.position.x,unit.position.y,unit.position.z);
                    third.physics.add.existing(nft);
                  }
                })
              })
            }

            /*
            otherPlayer.velocity.set(obj.velocity.x,obj.velocity.y,obj.velocity.z)
            if(obj.velocity.x === 0 && obj.velocity.y === 0 && obj.velocity.z === 0 ){
              otherPlayer.position.set(obj.position.x,obj.postion.y,obj.position.z)
            }
            */
            added = true;
          }
        });
        if(!added){
          await this.addOtherPlayer(obj);
          console.log(`Player ${obj.metadata.name} ${obj.metadata.description} joined`)
        }
      }
      if(obj.type === "shoot" ){

        const pos = new THREE.Vector3();
        pos.copy(obj.direction)
        pos.add(obj.origin)

        const sphere = this.third.physics.add.sphere(
          { radius: 0.025, x: pos.x, y: pos.y, z: pos.z, mass: 10, bufferGeometry: true },
          { phong: { color: 0x202020 } }
        );

        const force = 5;
        pos.copy(obj.direction)
        pos.multiplyScalar(5)
        sphere.body.applyForce(pos.x*force, pos.y*force, pos.z*force);

        setTimeout(() => {
          this.third.destroy(sphere);
        },2000)
        sphere.body.on.collision((otherObject, event) => {
          if (otherObject.name !== 'ground')
          if(otherObject.name === this.player.name){
            this.third.physics.destroy(this.player)
            if(this.info[this.player.metadata.name]){
              const base = this.info[this.player.metadata.name];
              const pos = base.position.clone();
              this.player.position.set(pos.x,pos.y+2,pos.z);

            } else {
              this.player.position.set(2, 4, -1);
            }
            this.third.destroy(sphere);
            this.third.physics.add.existing(this.player)
            this.army?.map(nft => {
              this.third.physics.destroy(nft)
              const pos = this.player.position.clone();
              nft.position.set(pos.x,pos.y+1,pos.z);
              this.third.physics.add.existing(nft);

            })

          }
        })

      }
      if(obj.type === "base"){
        this.mountBase(obj);
      }
      if(obj.type === "army" && !this.armies[obj.metadata.name]){
        this.generatePlayersArmy(obj);
      }
      /*
      if(obj.type === "message"){
        // create text texture
        const texture = new FLAT.TextTexture(`${obj.message}`)

        // texture in 3d space
        const sprite3d = new FLAT.TextSprite(texture)
        sprite3d.setScale(0.003)
        this.third.add.existing(sprite3d);
      }
      */



    } catch(err){
      console.log(err)
    }
  }
  onWindowResize = () => {

    this.third.camera.aspect = window.innerWidth / window.innerHeight;
    this.third.camera.updateProjectionMatrix();

    this.renderer.setSize( window.innerWidth, window.innerHeight );

  }
}


export default MainScene
