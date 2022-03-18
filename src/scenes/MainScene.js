import Phaser from 'phaser'
import { Waku,WakuMessage } from 'js-waku';

const topicMovements = 'hash-avatars/gamesv1/first-contact/movements/proto';
const topic = 'hash-avatars/games/first-contact';
const serviceId = "TheVibesTestDapp"

let metadata;
let coinbaseGame;
let contractAddress;
let room;
let waku;
let textInput;


export const setAttributes = (mt,cG,cA,r,tI) => {
  metadata = mt
  coinbaseGame = cG;
  contractAddress = cA;
  waku = r;
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
    this.room = room;
    this.waku = waku;
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

    this.load.image('ship', this.metadata.image.replace("ipfs://","https://ipfs.io/ipfs/"));
    this.load.image("tiles", "https://ipfs.io/ipfs/bafkreier6xkncx24wj4wm7td3v2k3ea2r2gpfg2qamtvh7digt27mmyqkm");

    this.load.tilemapTiledJSON("map", "https://ipfs.io/ipfs/bafybeiflup6dpz7wcqdi5k7u43pb722ietk3tlr2iknip635p3r4gg2sie");


  }

  create = async () => {
    const map = this.make.tilemap({key: 'map'});
    //this.add.image(1000,1020,'background')
    // Parameters are the name you gave the tileset in Tiled and then the key of the tileset image in
    // Pody.stop();ody.stop();haser's cache (i.e. the name you used in preload)
    const tileset = map.addTilesetImage("!CL_DEMO_32x32", "tiles");
    // Parameters: layer name (or index) from Tiled, tileset, x, y
    const bellowLayer = map.createLayer("Ground", tileset, 0, 0);
    const worldLayer = map.createLayer("Layer1", tileset, 0, 0);
    const waterLayer = map.createLayer("Water", tileset, 0, 0);
    const layer2 = map.createLayer("Layer2", tileset, 0, 0);

    worldLayer.setCollisionByProperty({ collides: true });
    waterLayer.setCollisionByProperty({ collides: true });
    layer2.setCollisionByProperty({ collides: true });
    worldLayer.setCollisionByExclusion([-1]);
    waterLayer.setCollisionByExclusion([-1]);
    layer2.setCollisionByExclusion([-1]);

    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.otherPlayers = this.physics.add.group();
    this.friendlyPlayers = this.physics.add.group();


    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    //this.createLandscape();
    this.cameras.main.setZoom(2);

    //  Add a player ship and camera follow
    this.player = this.physics.add.sprite(Phaser.Math.Between(4200, 4500), Phaser.Math.Between(4200, 4500), 'ship');
    this.player.setBounce(0).setCollideWorldBounds(true);
    this.player.displayWidth = 64;
    //scale evenly
    this.player.scaleY = this.player.scaleX;
    this.player.name = this.metadata.name;
    this.cameras.main.startFollow(this.player, false, 0.2, 0.2);
    this.cameras.main.setZoom(1);

    this.physics.add.collider(this.player,worldLayer);
    this.physics.add.collider(this.player,layer2);
    this.physics.add.collider(this.player,waterLayer);


    this.physics.add.collider(this.otherPlayers,worldLayer);
    this.physics.add.collider(this.otherPlayers,layer2);
    this.physics.add.collider(this.otherPlayers,waterLayer);

    this.physics.add.collider(this.friendlyPlayers, worldLayer);
    this.physics.add.collider(this.friendlyPlayers, layer2);
    this.physics.add.collider(this.friendlyPlayers, waterLayer);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.waku.relay.addObserver(this.handleMessages,[topicMovements]);
    //this.room.pubsub.subscribe(topicMovements,this.handleMessages);



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



  }

  update = async () => {

    //this.player.setVelocity(0);
    if(this.chat){
      this.chat.x = this.player.body.position.x + 280 ;
      this.chat.y = this.player.body.position.y - 150;
    }

    if (this.cursors.left.isDown){
      this.player.setVelocityX(-150);
    } else if (this.cursors.right.isDown){
      this.player.setVelocityX(150);
    } else if (this.cursors.up.isDown){
      this.player.setVelocityY(-150);
    } else if (this.cursors.down.isDown){
      this.player.setVelocityY(150);
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
      //const msgSend = new TextEncoder().encode(msg)
      //await this.room.pubsub.publish(topicMovements, msgSend)
      this.msgMovementStarted = true;
      this.sendMessage(topicMovements,msg)

    }
    if(!(this.cursors.left.isDown || this.cursors.right.isDown || this.cursors.up.isDown || this.cursors.down.isDown) &&
       this.msgMovementStarted){
      //const msgSend = new TextEncoder().encode(msg)
      //await this.room.pubsub.publish(topicMovements, msgSend)
      this.msgMovementStarted = false;
      this.sendMessage(topicMovements,msg)

    }

  }

  sendMessage = async (topic,msg) => {
    const wakuMessage = await WakuMessage.fromUtf8String(
      msg,
      topic
    );
    await this.waku.relay.send(wakuMessage);
  }

  prepareChat = () => {

    this.chat = this.add.text(this.player.x + 280, this.player.y - 150, "", { lineSpacing: 15, backgroundColor: "#21313CDD", color: "#26924F", padding: 10, fontStyle: "bold",fontSize: '10px' });
    this.chat.setFixedSize(400, 300);

    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.enterKey.on("down", async event => {
      if (textInput.value != "") {
        const obj = {
          message: textInput.value,
          from: coinbaseGame,
          timestamp: (new Date()).getTime(),
          metadata: metadata,
          type: "message"
        }
        const msgString = JSON.stringify(obj);
        await this.sendMessage(topicMovements, msgString);
        this.chatMessages.push(`${metadata.name}: ${textInput.value}`);
        if(this.chatMessages.length > 11) {
            this.chatMessages.shift();
        }
        this.chat.setText(this.chatMessages);
        textInput.value = "";
      }
    })
  }
  handleLastMessages = (retrievedMessages) => {
    const articles = retrievedMessages
    const handleMessages = this.handleMessages;
    console.log(articles)
    articles.map(wakuMessage => {
      try{
        console.log(`Message Stored Received: ${wakuMessage.payloadAsUtf8}`);
        handleMessages(wakuMessage.payloadAsUtf8);
      } catch(err){
        console.log(err)
      }
    });

  }
  handleMessages = (msg) => {
    try{
      //const obj = JSON.parse(new TextDecoder().decode(msg.data));
      console.log(msg)
      const obj = JSON.parse(msg.payloadAsUtf8);
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
            if(obj.velocity.x == 0 && obj.velocity.y === 0 ){
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

          loader.image(obj.metadata.name,obj.metadata.image.replace("ipfs://","https://ipfs.io/ipfs/"));
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
          const msgSend = JSON.stringify({
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
          this.player.setPosition(Phaser.Math.Between(500, 4600),Phaser.Math.Between(500, 4600));
          const str = JSON.stringify({
            message: `${this.metadata.name} died!`,
            from: this.coinbaseGame,
            timestamp: (new Date()).getTime(),
            metadata: this.metadata,
            type: "message"
          });
          //const msgSend = new TextEncoder().encode(str)
          //await this.room.pubsub.publish(topic, msgSend)
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
      //const msgSend = new TextEncoder().encode(msg)
      //await this.room.pubsub.publish(topicMovements, msgSend)
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
      message: `${this.metadata.name} joined`,
      from: this.coinbaseGame,
      timestamp: (new Date()).getTime(),
      metadata: this.metadata,
      type: "message"
    });
    await this.sendMessage(topicMovements,msg);
    this.chatMessages.push(`${this.metadata.name}: ${this.metadata.name}`);
    if(this.chatMessages.length > 11) {
        this.chatMessages.shift();
    }
    this.chat.setText(this.chatMessages);

    //let msgSend = new TextEncoder().encode(msg)
    //await this.room.pubsub.publish(topic, msgSend)


    msg = JSON.stringify({
      metadata: this.metadata,
      contractAddress: this.contractAddress,
      player: this.player,
      velocity: this.player.body.velocity,
      from: this.coinbaseGame,
      type: "movement"
    });
    await this.sendMessage(topicMovements,msg);


    //msgSend = new TextEncoder().encode(msg)
    //await this.room.pubsub.publish(topicMovements, msgSend)
  }

}


export default MainScene
