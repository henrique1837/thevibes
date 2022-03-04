import React, { useState,useCallback, useEffect,useMemo, useRef } from 'react'
import Phaser from 'phaser'
import { IonPhaser } from '@ion-phaser/react'
import { Container,Row,Col,Image,Spinner } from 'react-bootstrap';


import useWeb3Modal from './hooks/useWeb3Modal';
import useClient from './hooks/useGraphClient';
import useIPFS from './hooks/useIPFS';

let metadata;
let contractAddress;
let coinbaseGame;
let cursors;
let room;
const topicMovements = 'hash-avatars/games/first-contact/movements';
const topic = 'hash-avatars/games/first-contact';

class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainScene' })
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

    this.load.image('ship', metadata.image.replace("ipfs://","https://ipfs.io/ipfs/"));
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
    this.room = room;
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

    cursors = this.input.keyboard.createCursorKeys();

    room.pubsub.subscribe(topicMovements,this.handleMessages);



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

  handleMessages = async (msg) => {
    try{
      const obj = JSON.parse(new TextDecoder().decode(msg.data));
      if(obj.type === "movement"){
        let added = false;
        this.otherPlayers.getChildren().forEach(function (otherPlayer) {
          if (obj.metadata.name === otherPlayer.name && obj.contractAddress !== contractAddress) {
            otherPlayer.setVelocityX(0);
            otherPlayer.setVelocityY(0);
            otherPlayer.setPosition(obj.player.x, obj.player.y);
            added = true;
          }
        });
        this.friendlyPlayers.getChildren().forEach(function (otherPlayer) {
          if (obj.metadata.name === otherPlayer.name && obj.contractAddress === contractAddress) {
            otherPlayer.setVelocityX(0);
            otherPlayer.setVelocityY(0);
            otherPlayer.setPosition(obj.player.x, obj.player.y);
            added = true;
          }
        });
        if(!added && obj.metadata.name !== metadata.name){
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
          if(obj.contractAddress !== contractAddress){
            this.otherPlayers.add(otherPlayer);
          } else {
            this.friendlyPlayers.add(otherPlayer);
          }
        }
      }
      if(obj.type === "collision"){
        if(obj.name === metadata.name){
          this.player.setPosition(Phaser.Math.Between(500, 4600),Phaser.Math.Between(500, 4600));
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
  }

  handleCollision = async (player, otherPlayer) => {
    if(otherPlayer.body.touching.up){
      const msg = JSON.stringify({
        name: otherPlayer.name,
        type: "collision"
      });
      otherPlayer.destroy();
      const msgSend = new TextEncoder().encode(msg)
      await room.pubsub.publish(topicMovements, msgSend)
    } else if(player.body.touching.up) {
      const msg = JSON.stringify({
        name: player.name,
        type: "collision"
      });
      const msgSend = new TextEncoder().encode(msg)
      await room.pubsub.publish(topicMovements, msgSend)
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
  }
}


const game = {
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
  scene: MainScene
};

export default function App () {
  const [relayTime, setRelayTime] = useState(null);

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
  const [connections,setConnectedUsers] = useState(0);

  const destroy = () => {
    if (gameRef.current) {
      gameRef.current.destroy()
    }
    setInitialize(false)
  }

  const post =  async (msgEnter) => {
      const inputMessage = document.getElementById('input_message');
      let message = msg;
      if(!msg || msgEnter){
        message = msgEnter
      }
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

  };

  const setMetadata = (obj) => {
      metadata = obj.metadata;
      coinbaseGame = coinbase;
      if(!coinbaseGame){
        coinbaseGame = obj.metadata.name
      }
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
      },5000);

      setInterval(async () => {
        const newPeerIds = await ipfs.pubsub.peers(topic);
        setConnectedUsers(newPeerIds.length);
      },5000);

      room = ipfs;
      setSubscribed(true);

    }

  },[ipfs,msgs,subscribed]);

  useEffect(()=>{

    window.addEventListener('keydown', async event => {
      const inputMessage = document.getElementById('input_message');

      if (event.which === 13) {
        await post(inputMessage.value);
      }

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
        <>
        {
          ipfs && <IonPhaser ref={gameRef} game={game} initialize={initialize} />
        }
        <Container>
          <Row>
            <Col md={12}>
            {
              ipfs ?
              <>
              <p>Total of {peers ? peers.length + 1 : 0} players</p>
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
              <>
              <div style={{paddingTop: '100px'}}><Spinner animation="border" /></div>
              <p>Loading ipfs pubsub ...</p>
              </>
            }
            </Col>
          </Row>
        </Container>
        </> :
        <>
        <Container>
        <h1>Play for Fun</h1>
        <p>No matter how valuable is your NFT or where it is deployed, here we all have same value!</p>
        <div>
        <p>Feel free to fork and modify it!</p>
        <p><small>This game is offchain and does not sends transactions to blockchain, it uses IPFS pubsub room to allow multiplayer</small></p>
        {
          !coinbase ?
          <Row>
          <Col lg={6}>
            <button onClick={loadWeb3Modal}>Connect Wallet</button>
          </Col>
          <Col lg={6}>
            <button onClick={() => {
              setMetadata({
                metadata: {
                  name: `Guest-${Math.random()}`,
                  image: 'ipfs://QmeVRmVLPqUNZUKERq14uXPYbyRoUN7UE8Sha2Q4rT6oyF'
                },
                address: '0x000'
              })
            }}>Enter as Guest</button>
          </Col>
          </Row> :
          <>
          <p>Connected as {coinbase}</p>
          <h4>Select a NFT</h4>
          </>
        }
        </div>
        </Container>

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
        </>
      }

      <Container style={{paddingTop: '100px'}}>
        <Row>
          <Col md={2}>
            <p><small><a href="https://phaser.io/" target="_blank" rel="noreferrer">Done with phaser</a></small></p>
          </Col>
          <Col md={2}>
            <p><small><a href="https://thehashavatars.com" target="_blank" rel="noreferrer">Modified from The HashAvatars</a></small></p>
          </Col>
          <Col md={2}>
            <p><small><a href="https://thegraph.com/hosted-service/subgraph/leon-do/polygon-erc721-erc1155" target="_blank" rel="noreferrer">Subgraphs by Leon Du</a></small></p>
          </Col>
          <Col md={2}>
            <p><small><a href="https://github.com/henrique1837/thevibes" target="_blank" rel="noreferrer">Github</a></small></p>
          </Col>
          <Col md={2}>
            <p><small><a href="https://szadiart.itch.io/craftland-demo" target="_blank" rel="noreferrer">Tileset by Szadiart</a></small></p>
          </Col>
          <Col md={2}>
            <small><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABmJLR0QA/wD/AP+gvaeTAAAB/klEQVRYhe3XsU5UQRQG4E9M0MRGo6zaGGuBSAVqfA59C15DLEGWUt9EGxLtATFiI3HpsFEUC1yLe2523B12L7ujhfFPJnd25sx//jNn7rmz/EcP03iKA3SwEmN/jXcF3b62UkBAY95OTD7Aw+h3CggYyjuVWTCFc9G/WEBAzZHyZpHbqo9oTeC8FRz9vE9yxtMhooND7Ifx1pgiWrG2G1yHzni4U4JUxDzaeIdvOMIu1jE3Yu1EUWxhAz8NbmndTsKmiPOciC6OsYolXIq2hLWYq+2KOK+xEaSfcHeI3ULYdFVpKoJ51dYeJ86HVbeFsD3BbAkBbVVEq8nYqOr2LMbWSgjYDbLFZGxU1bwXY9ujyHOVsB+34vk2GbuQrK+rW/pu78TzdgP+kThSRXM5fp/HK4MpeBlzcCXGvpQQUKfgPm7iTcZ53V7jhio1jVLQBOtB9hyb0X+PR7iKa3iMvZjbxAuDB3dszKleqTrKPcxk7GbwIbE7wZ0SAugVoi6Wh9gtJ3bFCtF11anuL8WLBkvxj8RuJ9ZO7Hxb70C1/Z6O3Meo3bdmbBGtU4hmVdHu4Gu0bdWu1DnvF97oo5TW9/RCMm4UqYhGF5Jcfd9vqv4UtPQCGetWfDiB8xqfM7yNb8XHBQR8z/BmkUtB9vZ6RjTmTW/Fpf+a/QnefwS/ANmI8WcTkJHBAAAAAElFTkSuQmCC" alt="#" title="Users Connected to the Dapp" /> {connections + 1}</small>
          </Col>
        </Row>
      </Container>
    </center>
  )
}
