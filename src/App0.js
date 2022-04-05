import React, { useState,useCallback, useEffect,useMemo, useRef } from 'react'
import Phaser from 'phaser'
import { IonPhaser } from '@ion-phaser/react'
import { Container,Row,Col,Image,Spinner } from 'react-bootstrap';


import useWeb3Modal from './hooks/useWeb3Modal';
import useClient from './hooks/useGraphClient';
import useIPFS from './hooks/useIPFS';
import Game from './Game';
import {setAttributes} from './scenes/MainScene';

const topicMovements = 'hash-avatars/games/first-contact/movements';
const topic = 'hash-avatars/games/first-contact';


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

  const post =  async () => {
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

  };

  const setMetadata = (obj) => {
      console.log(Game)
      const scene = Game.scene;
      setAttributes(obj.metadata,coinbase,obj.address,ipfs);
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

      setSubscribed(true);

    }

  },[ipfs,msgs,subscribed]);

  useEffect(()=>{
    window.addEventListener('keydown', async event => {
      const inputMessage = document.getElementById('input_message');

      if (event.which === 13) {
        setMsg(inputMessage.value);
        await post();
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
          ipfs && <IonPhaser ref={gameRef} game={Game} initialize={initialize} metadata={metadataPlayer}/>
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
          !ipfs ?
          <>
            <div style={{paddingTop: '100px'}}><Spinner animation="border" /></div>
            <p>Loading ipfs pubsub ...</p>
          </> :
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
          {
            ipfs ?
            <small><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABmJLR0QA/wD/AP+gvaeTAAAB/klEQVRYhe3XsU5UQRQG4E9M0MRGo6zaGGuBSAVqfA59C15DLEGWUt9EGxLtATFiI3HpsFEUC1yLe2523B12L7ujhfFPJnd25sx//jNn7rmz/EcP03iKA3SwEmN/jXcF3b62UkBAY95OTD7Aw+h3CggYyjuVWTCFc9G/WEBAzZHyZpHbqo9oTeC8FRz9vE9yxtMhooND7Ifx1pgiWrG2G1yHzni4U4JUxDzaeIdvOMIu1jE3Yu1EUWxhAz8NbmndTsKmiPOciC6OsYolXIq2hLWYq+2KOK+xEaSfcHeI3ULYdFVpKoJ51dYeJ86HVbeFsD3BbAkBbVVEq8nYqOr2LMbWSgjYDbLFZGxU1bwXY9ujyHOVsB+34vk2GbuQrK+rW/pu78TzdgP+kThSRXM5fp/HK4MpeBlzcCXGvpQQUKfgPm7iTcZ53V7jhio1jVLQBOtB9hyb0X+PR7iKa3iMvZjbxAuDB3dszKleqTrKPcxk7GbwIbE7wZ0SAugVoi6Wh9gtJ3bFCtF11anuL8WLBkvxj8RuJ9ZO7Hxb70C1/Z6O3Meo3bdmbBGtU4hmVdHu4Gu0bdWu1DnvF97oo5TW9/RCMm4UqYhGF5Jcfd9vqv4UtPQCGetWfDiB8xqfM7yNb8XHBQR8z/BmkUtB9vZ6RjTmTW/Fpf+a/QnefwS/ANmI8WcTkJHBAAAAAElFTkSuQmCC" alt="#" title="Users Connected to the Dapp" /> {connections + 1}</small> :
            <small><Spinner animation="border" size="sm" /> Loading ipfs pubsub ...</small>

          }

          </Col>
        </Row>
      </Container>
    </center>
  )
}
