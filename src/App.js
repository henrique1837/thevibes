import React, { useState,useCallback, useEffect,useMemo, useRef } from 'react'
import Phaser from 'phaser'
import { IonPhaser } from '@ion-phaser/react'
import { Container,Row,Col,Image } from 'react-bootstrap';


import useWeb3Modal from './hooks/useWeb3Modal';
import useClient from './hooks/useGraphClient';
import useIPFS from './hooks/useIPFS';

let metadata;
let contractAddress;
let metadatas = [];
let players = [];
let loaded = [];
let coinbaseGame;
let cursors;
let room;
const topicMovements = 'hash-avatars/games/first-contact/movements';
const topic = 'hash-avatars/games/first-contact';

const MainScene = {

  init: function(){
    this.cameras.main.setBackgroundColor('#24252A')
  },
  preload: function(){
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

    this.load.image('ship', metadata.image.replace("ipfs://","https://ipfs.io/ipfs/"));
    this.load.image("tiles", "https://ipfs.io/ipfs/bafkreier6xkncx24wj4wm7td3v2k3ea2r2gpfg2qamtvh7digt27mmyqkm");

    this.load.tilemapTiledJSON("map", "https://ipfs.io/ipfs/bafkreicmd6kczq36zz6sjdesnm7npxes5bargwkvd52t3562u4uuuyz2cy");


  },

  create: async function(){
    const map = this.make.tilemap({key: 'map'});
    //this.add.image(1000,1020,'background')
    // Parameters are the name you gave the tileset in Tiled and then the key of the tileset image in
    // Phaser's cache (i.e. the name you used in preload)
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
    this.room = room;
    this.otherPlayers = this.physics.add.group();
    this.friendlyPlayers = this.physics.add.group();


    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    //this.createLandscape();
    this.cameras.main.setZoom(2);

    //  Add a player ship and camera follow
    this.player = this.physics.add.sprite(Phaser.Math.Between(0, 1600), Phaser.Math.Between(0, 1600), 'ship');
    this.player.setBounce(0).setCollideWorldBounds(true);
    this.player.displayWidth = 32;
    //scale evenly
    this.player.scaleY = this.player.scaleX;
    this.player.name = metadata.name;
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
    let loader = new Phaser.Loader.LoaderPlugin(this);

    cursors = this.input.keyboard.createCursorKeys();

    room.pubsub.subscribe(topicMovements,async (msg) => {
      try{
        const obj = JSON.parse(new TextDecoder().decode(msg.data));
        if(obj.type === "movement"){
          let added = false;
          this.otherPlayers.getChildren().forEach(function (otherPlayer) {
            if (obj.metadata.name === otherPlayer.name && obj.contractAddress !== contractAddress) {
              otherPlayer.setPosition(obj.player.x, obj.player.y);
              added = true;
            }
          });
          this.friendlyPlayers.getChildren().forEach(function (otherPlayer) {
            if (obj.metadata.name === otherPlayer.name && obj.contractAddress === contractAddress) {
              otherPlayer.setPosition(obj.player.x, obj.player.y);
              added = true;
            }
          });
          if(!added && obj.metadata.name !== metadata.name){
            const otherPlayer = this.physics.add.sprite(0, 0,  obj.metadata.name)
            .setInteractive();
            otherPlayer.displayWidth = 32;
            otherPlayer.scaleY = otherPlayer.scaleX;

            otherPlayer.setCollideWorldBounds(true);
            otherPlayer.name =  obj.metadata.name
            otherPlayer.contractAddress = obj.contractAddress;
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
          }
        }
        if(obj.type === "collision"){
          if(obj.name === metadata.name){
            this.player.setPosition(Phaser.Math.Between(0, 1600),Phaser.Math.Between(0, 1600));
            const str = JSON.stringify({
              message: `${metadata.name} died!`,
              from: coinbaseGame,
              timestamp: (new Date()).getTime(),
              metadata: metadata,
              type: "message"
            });
            const msgSend = new TextEncoder().encode(str)
            await room.pubsub.publish(topic, msgSend)
          }
        }
      } catch(err){
        console.log(err)
      }
    });



    this.physics.add.collider(this.player, this.friendlyPlayers);

    this.physics.add.collider(this.player,this.otherPlayers,async (player, enemy) => {
      if(enemy.body.touching.up){
        const msg = JSON.stringify({
          name: enemy.name,
          type: "collision"
        });
        enemy.destroy();
        const msgSend = new TextEncoder().encode(msg)
        await room.pubsub.publish(topicMovements, msgSend)
      } else if(player.body.touching.up) {
        const msg = JSON.stringify({
          name: player.name,
          type: "collision"
        });
        const msgSend = new TextEncoder().encode(msg)
        await room.pubsub.publish(topicMovements, msgSend)
      } else {
        player.setVelocityX(0);
        player.setVelocityY(0);

        enemy.setVelocityX(0);
        enemy.setVelocityX(0);
      }
    },null, this);





    let msg = JSON.stringify({
      message: `${metadata.name} joined HashVillage!`,
      from: coinbaseGame,
      timestamp: (new Date()).getTime(),
      metadata: metadata,
      type: "message"
    });

    let msgSend = new TextEncoder().encode(msg)
    await room.pubsub.publish(topic, msgSend)


    msg = JSON.stringify({
      metadata: metadata,
      contractAddress: contractAddress,
      player: this.player,
      from: coinbaseGame,
      type: "movement"
    });


    msgSend = new TextEncoder().encode(msg)
    await room.pubsub.publish(topicMovements, msgSend)
  },

  update: async function(){

    //this.player.setVelocity(0);

    const msg = JSON.stringify({
      contractAddress: contractAddress,
      metadata: metadata,
      player: this.player,
      from: coinbaseGame,
      type: "movement"
    });
    if(cursors.left.isDown || cursors.right.isDown || cursors.up.isDown || cursors.down.isDown){
      const msgSend = new TextEncoder().encode(msg)
      await room.pubsub.publish(topicMovements, msgSend)
    }
    if (cursors.left.isDown){
      this.player.setVelocityX(-150);
    } else if (cursors.right.isDown){
      this.player.setVelocityX(150);
    } else if (cursors.up.isDown){
      this.player.setVelocityY(-150);
    } else if (cursors.down.isDown){
      this.player.setVelocityY(150);
    } else {
      this.player.setVelocity(0);
    }

  }
}

const game = {
  width: "80%",
  height: "60%",
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
  scene: MainScene
};

export default function App () {
  const gameRef = useRef(null);
  const {
    provider,
    coinbase,
    netId,
    connecting,
    loadWeb3Modal
  } = useWeb3Modal();

  const { ipfs } = useIPFS();

  const {
      client,
      initiateClient,
      getNftsFrom
  } = useClient();


  const [msgs,setMsgs] = useState([]);
  const [myOwnedNfts,setMyOwnedNfts] = useState();
  const [myOwnedERC1155,setMyOwnedERC1155] = useState();

  const [loadingMyNFTs,setLoadingMyNFTs] = useState(true);

  const [metadataPlayer,setMetadataPlayer] = useState();
  // Call `setInitialize` when you want to initialize your game! :)
  const [initialize, setInitialize] = useState(false);
  const [msg,setMsg] = useState();
  const [subscribed,setSubscribed] = useState();
  const [peers,setPeersIds] = useState(0);
  const destroy = () => {
    if (gameRef.current) {
      gameRef.current.destroy()
    }
    setInitialize(false)
  }

  const post =  useCallback(async () => {
      const inputMessage = document.getElementById('input_message');
      const msgString = JSON.stringify({
        message: msg,
        from: coinbase,
        timestamp: (new Date()).getTime(),
        metadata: metadataPlayer,
        type: "message"
      });
      const msgToSend = new TextEncoder().encode(msgString)

      await ipfs.pubsub.publish(topic, msgToSend);
      inputMessage.value = '';
      inputMessage.innerText = '';
      setMsg('');

  },[ipfs,coinbase,metadataPlayer,document.getElementById('input_message'),msg]);

  const setMetadata = (obj) => {
      metadata = obj.metadata;
      coinbaseGame = coinbase;
      contractAddress = obj.address;
      setMetadataPlayer(obj.metadata);
      setInitialize(true);
  }

  const getMetadata = item => {
    return(
      new Promise(async (resolve,reject) => {
        try {
          let uri;
          let tokenURI;
          const contractAddress = item.id.split("/")[0];
          //ERC1155
          if(item.token){
            tokenURI = item.token.uri;
          } else {
            tokenURI = item.uri;
          }
          if(!tokenURI){
            resolve({});
          }
          if(!tokenURI.includes("://")){
              uri = `https://ipfs.io/ipfs/${tokenURI}`;
          } else if(tokenURI.includes("ipfs://") && !tokenURI.includes("https://ipfs.io/ipfs/")){
            uri = tokenURI.replace("ipfs://","https://ipfs.io/ipfs/");
          } else {
            uri = tokenURI
          }
          let metadataToken = JSON.parse(await (await fetch(uri)).text());
          resolve({
            address: contractAddress,
            metadata: metadataToken
          })
        } catch(err){
          resolve({});
        }
      })
    )
  }
  useEffect(() => {
    if(!coinbase){
      setLoadingMyNFTs(false);
      setMyOwnedNfts();
      setMyOwnedERC1155();
    }
  },[coinbase])

  useMemo(() => {
    if(!client && coinbase){
      setLoadingMyNFTs(true);
      const newClient = initiateClient(netId);
    }
  },[client,coinbase,netId]);
  useMemo(async () => {
    if(client && coinbase && !myOwnedNfts){
      const ownedNfts = await getNftsFrom(coinbase);
      const erc721Tokens = ownedNfts.data.accounts[0].ERC721tokens;
      const erc1155Tokens = ownedNfts.data.accounts[0].ERC1155balances;
      let promises = erc721Tokens.map(getMetadata);
      const newMyOwnedNfts = await Promise.all(promises)
      setMyOwnedNfts(newMyOwnedNfts);

      promises = erc1155Tokens.map(getMetadata);
      const newMyOwnedERC1155 = await Promise.all(promises)
      setMyOwnedERC1155(newMyOwnedERC1155);

      setLoadingMyNFTs(false);
    }
  },[client,coinbase,myOwnedNfts]);
  useMemo(async () => {
    if(ipfs && !subscribed){
      await ipfs.pubsub.subscribe(topic, async (msg) => {
        console.log(new TextDecoder().decode(msg.data));
        const obj = JSON.parse(new TextDecoder().decode(msg.data));
        const newMsgs = msgs;
        newMsgs.unshift(obj);
        setMsgs(newMsgs);
      });
      setInterval(async () => {
        const newPeerIds = await ipfs.pubsub.peers(topicMovements);
        setPeersIds(newPeerIds);
      },5000)

      room = ipfs;
      setSubscribed(true);

    }

  },[ipfs,msgs]);

  useMemo(()=>{
    const inputMessage = document.getElementById('input_message');
    window.addEventListener('keydown', async event => {
      /*
      if (event.which === 13) {
        setMsg(inputMessage.value);
        await post();
      }
      */
      if (event.which === 32) {
        if (document.activeElement === inputMessage) {
          inputMessage.value = inputMessage.value + ' ';
          setMsg(inputMessage.value)
        }
      }
    });
  },[document.getElementById('input_message')])
  return (
    <center className="App">
      {
        initialize ?
        <Container>
          <Row>
            <Col md={12} style={{paddingTop:"50px"}}>
              {
                ipfs && <IonPhaser ref={gameRef} game={game} initialize={initialize} />
              }
            </Col>
            <Col md={12}>
            {
              ipfs ?
              <>
              <p>Total of {peers?.length} players</p>
              <input  placeholder="Message" id='input_message' onChange={(e) => {setMsg(e.target.value);}} />
              <button onClick={() => {post()}}>Send Message</button>
              <Container>
                {
                msgs?.map((obj) => {

                  return(
                    <Row>
                      <Col md={4}>
                        <img src={obj.metadata.image.replace("ipfs://","https://ipfs.io/ipfs/")} size='sm'style={{width: '50px'}} />
                        <p><small>{obj.metadata.name}</small></p>
                      </Col>
                      <Col md={8}>
                        <p>{obj.message}</p>
                      </Col>
                    </Row>

                  )
                })
              }
              </Container>
              </> :
              <p>Loading ipfs pubsub ...</p>
            }
            </Col>

          </Row>
        </Container> :
        <>
        <h1>Play for Fun</h1>
        <p>No matter how valuable is your NFT or where it is deployed, here we all have same value!</p>
        <div>
        <p>Feel free to fork and modify it!</p>
        <p><small>This game is offchain and does not sends transactions to blockchain, it uses IPFS pubsub room to allow multiplayer</small></p>
        {
          !coinbase ?
          <button onClick={loadWeb3Modal}>Connect Wallet</button> :
          <>
          <p>Connected as {coinbase}</p>
          <h4>Select a NFT</h4>
          </>
        }
        </div>

        {

          loadingMyNFTs &&
          <center>
            <p>Loading your NFTs ...</p>
          </center>

        }
        {
          myOwnedNfts?.length > 0 &&
          <Container>
          <h5>ERC721</h5>
          <Row style={{textAlign: 'center'}}>
          {
            myOwnedNfts?.map(obj => {
              if(!obj.metadata?.image){
                return;
              }
              let tokenURI = obj.metadata.image;
              let uri;
              if(!tokenURI.includes("://")){
                uri = `https://ipfs.io/ipfs/${tokenURI}`;
              } else if(tokenURI.includes("ipfs://") && !tokenURI.includes("https://ipfs.io/ipfs/")){
                uri = tokenURI.replace("ipfs://","https://ipfs.io/ipfs/");
              } else {
                uri = tokenURI
              }
              return(
                <Col style={{paddingTop:'80px'}}>

                  <center>
                    <div>
                      <p><b>{obj.metadata.name}</b></p>
                    </div>
                    <div>
                      <Image src={uri} width="150px"/>
                    </div>
                    <div>
                      <button onClick={() => {setMetadata(obj)}} size="small" mode="strong">Select</button>
                    </div>
                  </center>

                </Col>
              )
            })
          }
          </Row>
          </Container>
        }
        {
          myOwnedERC1155?.length > 0 &&
          <Container>
          <h5>ERC1155</h5>
          <Row style={{textAlign: 'center'}}>
          {
            myOwnedERC1155?.map(obj => {
              if(!obj.metadata?.image){
                return;
              }
              let tokenURI = obj.metadata.image;
              let uri;
              if(!tokenURI.includes("://")){
                uri = `https://ipfs.io/ipfs/${tokenURI}`;
              } else if(tokenURI.includes("ipfs://") && !tokenURI.includes("https://ipfs.io/ipfs/")){
                uri = tokenURI.replace("ipfs://","https://ipfs.io/ipfs/");
              } else {
                uri = tokenURI
              }
              return(
                <Col style={{paddingTop:'80px'}}>

                  <center>
                    <div>
                      <p><b>{obj.metadata.name}</b></p>
                    </div>
                    <div>
                      <Image src={uri} width="150px"/>
                    </div>
                    <div>
                      <button onClick={() => {setMetadata(obj)}} size="small" mode="strong">Select</button>
                    </div>
                  </center>

                </Col>
              )
            })
          }
          </Row>
          </Container>
        }
        <Container>
          <Row>
            <Col md={3}>
              <p><small><a href="https://phaser.io/" target="_blank">Done with phaser</a></small></p>
            </Col>
            <Col md={3}>
              <p><small><a href="https://thehashavatars.com" target="_blank" >From The HashAvatars</a></small></p>
            </Col>
            <Col md={3}>
              <p><small><a href="https://thegraph.com/hosted-service/subgraph/leon-do/polygon-erc721-erc1155" target="_blank">Subgraphs by Leon Du</a></small></p>
            </Col>
            <Col md={3}>
              <p><small>Github</small></p>
            </Col>
          </Row>
        </Container>
        </>
      }
    </center>
  )
}
