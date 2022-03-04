import Phaser from 'phaser'


const topicMovements = 'hash-avatars/games/first-contact/movements';
const topic = 'hash-avatars/games/first-contact';

class MainScene extends Phaser.Scene {
  constructor(metadata) {
    super({ key: 'MainScene' })
    this.metadata = metadata;
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
    this.player = this.physics.add.sprite(Phaser.Math.Between(500, 4500), Phaser.Math.Between(500, 4500), 'ship');
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

    this.room.pubsub.subscribe(topicMovements,this.handleMessages);



    this.physics.add.collider(this.player,this.friendlyPlayers,(player,friend) => {
      player.setVelocity(0,0);
      player.setAcceleration(0,0);
      player.stop();
      friend.setVelocity(0,0);
      friend.setAcceleration(0,0);
      friend.stop();
    },null,this);
    this.physics.add.collider(this.player,this.otherPlayers,this.handleCollision,null, this);


    this.sendMessagePlayerEntered();



  }

  update = async () => {

    //this.player.setVelocity(0);

    const msg = JSON.stringify({
      contractAddress: this.contractAddress,
      metadata: this.metadata,
      player: this.player,
      from: this.coinbaseGame,
      type: "movement"
    });
    if(this.cursors.left.isDown || this.cursors.right.isDown || this.cursors.up.isDown || this.cursors.down.isDown){
      const msgSend = new TextEncoder().encode(msg)
      await this.room.pubsub.publish(topicMovements, msgSend)
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

  }

  handleMessages = async (msg) => {
    try{
      const obj = JSON.parse(new TextDecoder().decode(msg.data));
      if(obj.type === "movement"){
        let added = false;
        this.otherPlayers.getChildren().forEach(function (otherPlayer) {
          if (obj.metadata.name === otherPlayer.name && obj.contractAddress !== this.contractAddress) {
            otherPlayer.setVelocityX(0);
            otherPlayer.setVelocityY(0);
            otherPlayer.setPosition(obj.player.x, obj.player.y);
            added = true;
          }
        });
        this.friendlyPlayers.getChildren().forEach(function (otherPlayer) {
          if (obj.metadata.name === otherPlayer.name && obj.contractAddress === this.contractAddress) {
            otherPlayer.setVelocityX(0);
            otherPlayer.setVelocityY(0);
            otherPlayer.setPosition(obj.player.x, obj.player.y);
            added = true;
          }
        });
        if(!added && obj.metadata.name !== this.metadata.name){
          const otherPlayer = this.physics.add.sprite(0, 0,  obj.metadata.name)
            .setInteractive();
          otherPlayer.setBounce(0);
          otherPlayer.setVelocityX(0);
          otherPlayer.setVelocityY(0);
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
          if(obj.contractAddress !== this.contractAddress){
            this.otherPlayers.add(otherPlayer);
          } else {
            this.friendlyPlayers.add(otherPlayer);
          }
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
          const msgSend = new TextEncoder().encode(str)
          await this.room.pubsub.publish(topic, msgSend)
        }
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
      const msgSend = new TextEncoder().encode(msg)
      await this.room.pubsub.publish(topicMovements, msgSend)
    } else if(player.body.touching.up) {
      const msg = JSON.stringify({
        name: player.name,
        type: "collision"
      });
      const msgSend = new TextEncoder().encode(msg)
      await this.room.pubsub.publish(topicMovements, msgSend)
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
      message: `${this.metadata.name} joined HashVillage!`,
      from: this.coinbaseGame,
      timestamp: (new Date()).getTime(),
      metadata: this.metadata,
      type: "message"
    });

    let msgSend = new TextEncoder().encode(msg)
    await this.room.pubsub.publish(topic, msgSend)


    msg = JSON.stringify({
      metadata: this.metadata,
      contractAddress: this.contractAddress,
      player: this.player,
      from: this.coinbaseGame,
      type: "movement"
    });


    msgSend = new TextEncoder().encode(msg)
    await this.room.pubsub.publish(topicMovements, msgSend)
  }
}


export default MainScene
