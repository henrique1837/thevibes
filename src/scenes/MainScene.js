import Phaser from 'phaser'


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

class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainScene' })
    this.metadata = metadata;
    this.contractAddress = contractAddress;
    this.coinbaseGame = coinbaseGame;
    this.ipfs = ipfs;
    this.totalPlayers = 1;
    this.chatMessages = [];
  }

  init(){
    this.cameras.main.setBackgroundColor('#24252A')
  }


  preload = () => {
    let progressBar = this.add.graphics();
    let progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(240, 270, 320, 50);

    let width = this.cameras.main.width;
    let height = this.cameras.main.height;
    let loadingText = this.make.text({
        x: width / 2,
        y: height / 2 - 50,
        text: 'Loading...',
        style: {
            font: '20px monospace',
            fill: '#ffffff'
        }
    });
    loadingText.setOrigin(0.5, 0.5);

    let percentText = this.make.text({
        x: width / 2,
        y: height / 2 - 5,
        text: '0%',
        style: {
            font: '18px monospace',
            fill: '#ffffff'
        }
    });
    percentText.setOrigin(0.5, 0.5);

    let assetText = this.make.text({
        x: width / 2,
        y: height / 2 + 50,
        text: '',
        style: {
            font: '18px monospace',
            fill: '#ffffff'
        }
    });
    assetText.setOrigin(0.5, 0.5);
    this.load.on('progress', function (value) {
      percentText.setText(parseInt(value * 100) + '%');
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(250, 280, 300 * value, 30);
    });

    this.load.on('complete', function () {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
      assetText.destroy();
    });
    console.log(this);

    if(this.metadata.image_data){
      let image_data;
      if(this.metadata.image_data.includes("data:image/svg+xml;base64,")){
        image_data = atob(this.metadata.image_data.replace("data:image/svg+xml;base64,",""));
      } else {
        image_data = this.metadata.image_data.replace("data:image/svg+xml;utf8,","");
      }
      const blob = new Blob([image_data], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      this.load.svg('ship', url);
    } else {
      if(this.metadata.image.includes("ipfs://ipfs/")){
        this.load.image('ship', this.metadata.image.replace("ipfs://ipfs/","https://nftstorage.link/ipfs/"));
      } else if(this.metadata.image.includes("data:image/png;base64")) {
        this.textures.addBase64('ship', this.metadata.image);
      } else {
        this.load.image('ship', this.metadata.image.replace("ipfs://","https://nftstorage.link/ipfs/"));
      }
    }

    this.load.image("tiles", `https://nftstorage.link/ipfs/${mapTiles}`);

    this.load.tilemapTiledJSON("map", `https://nftstorage.link/ipfs/${mapHash}`);


  }

  create = async () => {

    const map = this.make.tilemap({key: 'map'});
    let layers = [];
    this.map = map;
    //this.add.image(1000,1020,'background')
    // Parameters are the name you gave the tileset in Tiled and then the key of the tileset image in
    // Pody.stop();ody.stop();haser's cache (i.e. the name you used in preload)
    const tileset = map.addTilesetImage(mapName, "tiles");

    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.otherPlayers = this.physics.add.group();
    this.friendlyPlayers = this.physics.add.group();
    for(let layer of map.layers){
      const l = map.createLayer(layer.name,tileset,0,0);
      console.log(l)

      layers.push(l)
      l.setCollisionByProperty({ collides: true });
    }
    //  Add a player ship and camera follow
    this.player = this.physics.add.sprite(
      Phaser.Math.Between(map.widthInPixels/2, map.widthInPixels/3),
      Phaser.Math.Between(map.heightInPixels/2, map.heightInPixels/3),
      'ship');
    this.player.setBounce(0).setCollideWorldBounds(true);
    this.player.displayWidth = 64;
    //scale evenly
    this.player.scaleY = this.player.scaleX;
    this.player.name = this.metadata.name;

    // Adaptation for ColorGhosts
    this.player.nftVelocity = 0;
    if(this.metadata.attributes){
      this.metadata.attributes.map(item => {
        if(item.trait_type.toLowerCase() === "velocity"){
          this.player.nftVelocity = Number(item.value)
        }
      })
    }


    for(let l of layers){
      let collides = false;
      if(l.layer.properties[0]){
          if(l.layer.properties[0].value === true){
            collides = true
          }
      }
      if(l.layer.data[0][0].properties.collides){
        collides = true
      }
      console.log(collides)
      if(collides){
        this.physics.add.collider(this.player,l);
        this.physics.add.collider(this.otherPlayers,l);
        this.physics.add.collider(this.friendlyPlayers, l);
        l.setCollisionByExclusion([-1]);

      }
    }

    this.cameras.main.startFollow(this.player, false, 0.2, 0.2);
    this.cameras.main.setZoom(1);

    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);


    this.cursors = this.input.keyboard.createCursorKeys();

    this.ipfs.pubsub.subscribe(topicMovements,this.handleMessages);
    setInterval(async () => {
      const newPeerIds = await this.ipfs.pubsub.peers(topicMovements);
      if(this.totalPlayers - 1 !== newPeerIds.length){
        this.totalPlayers = newPeerIds.length + 1;
        this.totalPlayersCounter.destroy();
        this.totalPlayersCounter = this.add.text(this.player.x + 280, this.player.y - 200,`Total of ${this.totalPlayers} players online`, { lineSpacing: 15, backgroundColor: "#21313CDD", color: "#26924F", padding: 10, fontStyle: "bold",fontSize: '10px' });

      }
    },5000);


    this.physics.add.collider(this.player,this.friendlyPlayers,(player,friend) => {
      player.setVelocity(0,0);
      player.setAcceleration(0,0);
      player.stop();
      friend.setVelocity(0,0);
      friend.setAcceleration(0,0);
      friend.stop();
    },null,this);
    this.physics.add.collider(this.player,this.otherPlayers,this.handleCollision,null, this);



    this.prepareChat();
    this.sendMessagePlayerEntered();


    window.addEventListener('resize', this.resize);
    this.resize();

  }

  update = async () => {

    if(this.chat){
      this.chat.x = this.player.body.position.x + 280 ;
      this.chat.y = this.player.body.position.y - 150;
    }
    if(this.totalPlayersCounter){
      this.totalPlayersCounter.x = this.player.body.position.x + 280 ;
      this.totalPlayersCounter.y = this.player.body.position.y - 200;
    }
    if (this.cursors.left.isDown){
      this.player.setVelocityX(-150-this.player.nftVelocity);
    } else if (this.cursors.right.isDown){
      this.player.setVelocityX(150+this.player.nftVelocity);
    } else if (this.cursors.up.isDown){
      this.player.setVelocityY(-150-this.player.nftVelocity);
    } else if (this.cursors.down.isDown){
      this.player.setVelocityY(150+this.player.nftVelocity);
    } else {
      this.player.setVelocity(0);
    }
    const obj = {
      contractAddress: this.contractAddress,
      metadata: this.metadata,
      player: this.player,
      velocity: this.player.body.velocity,
      from: this.coinbaseGame,
      type: "movement"
    };
    const msg = JSON.stringify(obj);

    if((this.cursors.left.isDown || this.cursors.right.isDown || this.cursors.up.isDown || this.cursors.down.isDown) &&
       !this.msgMovementStarted){

      this.msgMovementStarted = true;
      this.sendMessage(topicMovements,msg)

    }
    if(!(this.cursors.left.isDown || this.cursors.right.isDown || this.cursors.up.isDown || this.cursors.down.isDown) &&
       this.msgMovementStarted){

      this.msgMovementStarted = false;
      this.sendMessage(topicMovements,msg)

    }

  }

  sendMessage = async (topic,msg) => {

    const msgSend = new TextEncoder().encode(msg)
    await this.ipfs.pubsub.publish(topic, msgSend)
  }

  prepareChat = () => {
    this.totalPlayersCounter = this.add.text(this.player.x + 280, this.player.y - 200,`Total of ${this.totalPlayers} players online`, { lineSpacing: 15, backgroundColor: "#21313CDD", color: "#26924F", padding: 10, fontStyle: "bold",fontSize: '10px' });

    this.chat = this.add.text(this.player.x + 280, this.player.y - 150, "", { lineSpacing: 15, backgroundColor: "#21313CDD", color: "#26924F", padding: 10, fontStyle: "bold",fontSize: '10px' });
    this.chat.setFixedSize(400, 300);

    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.enterKey.on("down", async event => {
      if (textInput.value !== "") {
        const obj = {
          message: textInput.value,
          from: coinbaseGame,
          timestamp: (new Date()).getTime(),
          metadata: metadata,
          type: "message"
        }
        const msgString = JSON.stringify(obj);
        await this.sendMessage(topicMovements, msgString);
        textInput.value = ""
      }
    })
  }
  handleMessages = (msg) => {
    try{
      const obj = JSON.parse(new TextDecoder().decode(msg.data));

      if(obj.type === "movement" && obj.metadata.name !== metadata.name){
        console.log("Movement from "+obj.metadata.name);
        let added = false;
        this.otherPlayers.getChildren().forEach(function (otherPlayer) {
          if (obj.metadata.name === otherPlayer.name && obj.contractAddress !== contractAddress) {
            otherPlayer.setPosition(obj.player.x, obj.player.y);

            //otherPlayer.setPosition(obj.player.x, obj.player.y);
            added = true;
          }
        });
        this.friendlyPlayers.getChildren().forEach(function (otherPlayer) {
          if (obj.metadata.name === otherPlayer.name && obj.contractAddress === contractAddress) {
            console.log(obj.velocity)
            otherPlayer.setVelocity(obj.velocity.x,obj.velocity.y);
            if(obj.velocity.x === 0 && obj.velocity.y === 0 ){
              otherPlayer.setPosition(obj.player.x,obj.player.y)
            }

            //otherPlayer.setPosition(obj.player.x, obj.player.y);
            added = true;
          }
        });
        if(!added){
          const otherPlayer = this.physics.add.sprite(obj.player.x,obj.player.y,  obj.metadata.name)
            .setInteractive();
          otherPlayer.setFriction(1);

          otherPlayer.setBounce(0);
          otherPlayer.setVelocity(0);
          otherPlayer.scaleX = this.player.scaleX;
          otherPlayer.scaleY = otherPlayer.scaleX;

          otherPlayer.setCollideWorldBounds(true);
          otherPlayer.name =  obj.metadata.name
          otherPlayer.contractAddress = obj.contractAddress;
          const loader = new Phaser.Loader.LoaderPlugin(this);
          console.log(loader)
          if(obj.metadata.image_data){
            let image_data;
            if(obj.metadata.image_data.includes("data:image/svg+xml;base64,")){
              image_data = atob(obj.metadata.image_data.replace("data:image/svg+xml;base64,",""));
            } else {
              image_data = obj.metadata.image_data.replace("data:image/svg+xml;utf8,","");
            }
            const blob = new Blob([image_data], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            loader.svg(obj.metadata.name, url);
          } else {
            loader.image(obj.metadata.name,obj.metadata.image.replace("ipfs://","https://nftstorage.link/ipfs/"));
          }
          loader.once(Phaser.Loader.Events.COMPLETE, () => {
            // texture loaded so use instead of the placeholder
            otherPlayer.setTexture(obj.metadata.name)
          })
          loader.start();
          otherPlayer.on('pointerdown', function (pointer) {
            window.open(obj.metadata.external_url,"_blank");
          });
          if(obj.contractAddress !== contractAddress){
            this.otherPlayers.add(otherPlayer);
          } else {
            this.friendlyPlayers.add(otherPlayer);
          }
          let msgSend = JSON.stringify({
            metadata: this.metadata,
            contractAddress: this.contractAddress,
            player: this.player,
            velocity: this.player.body.velocity,
            from: this.coinbaseGame,
            type: "movement"
          });
          this.sendMessage(topicMovements,msgSend);

        }
      }
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

    } catch(err){
      console.log(err)
    }
  }

  handleCollision = async (player, otherPlayer) => {
    if(otherPlayer.body.touching.up){
      const msg = JSON.stringify({
        name: otherPlayer.name,
        type: "collision"
      });
      otherPlayer.destroy();
      await this.sendMessage(topicMovements, msg)
    } else if(player.body.touching.up) {
      const msg = JSON.stringify({
        name: player.name,
        type: "collision"
      });
      this.sendMessage(topicMovements,msg);
    }
    player.setVelocity(0,0);
    player.setAcceleration(0,0);
    player.stop();
    otherPlayer.setVelocity(0,0);
    otherPlayer.setAcceleration(0,0);
    otherPlayer.stop();
  }

  sendMessagePlayerEntered = async () => {
    let msg = JSON.stringify({
      message: `Connected`,
      from: this.coinbaseGame,
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
      from: this.coinbaseGame,
      type: "movement"
    });
    await this.sendMessage(topicMovements,msg);

  }


  resize = () => {
    const canvas = this.game.canvas, width = window.innerWidth, height = window.innerHeight;
    const wratio = width / height, ratio = canvas.width / canvas.height;
    if (wratio < ratio) {
        canvas.style.width = width + "px";
        canvas.style.height = (width / ratio) + "px";
    } else {
        canvas.style.width = (height * ratio) + "px";
        canvas.style.height = height + "px";
    }
  }

}



export default MainScene
