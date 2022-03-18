import React, { useState,useCallback, useEffect,useMemo, useRef } from 'react'
import Phaser from 'phaser'
import { IonPhaser } from '@ion-phaser/react'
import { Container,Row,Col,Image,Spinner } from 'react-bootstrap';




import useWeb3Modal from './hooks/useWeb3Modal';
import useClient from './hooks/useGraphClient';
import useIPFS from './hooks/useIPFS';
import Game from './Game';
import {setAttributes,setTextInput} from './scenes/MainScene';

import Footer from './components/Footer';
import MyNfts from './components/MyNfts';



const topicMovements = 'hash-avatars/games/first-contact/movements';
const topic = 'hash-avatars/games/first-contact';

export default function App () {

  const [graphErr,setGraphErr] = useState();

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
      console.log(Game)
      const scene = Game.scene;
      setAttributes(obj.metadata,coinbase,obj.address,ipfs);
      setMetadataPlayer(obj.metadata);
      setTextInput(document.getElementById("textInput"));
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
      try{
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
      } catch(err){
        console.log(err)
        setGraphErr(true)
        setLoadingMyNFTs(false);
      }
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
      const inputMessage = document.getElementById('textInput');

      if (event.which === 32) {
        if (document.activeElement === inputMessage) {
          inputMessage.value = inputMessage.value + ' ';
        }
      }
    });

  },[])

  return (
    <center className="App">
      {
        initialize ?
        <>
        {
          ipfs && <IonPhaser ref={gameRef} game={Game} initialize={initialize} metadata={metadataPlayer}/>
        }
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

          loadingMyNFTs && ipfs ?
          <center>
            <p>Loading your NFTs ...</p>
          </center> :
          !graphErr ?
          <MyNfts myOwnedERC1155={myOwnedERC1155} myOwnedNfts={myOwnedNfts} setMetadata={setMetadata} /> :
          ipfs &&
          <center>
            <p>Could not load your NFTs, try changing network or enter as guest</p>
            <button onClick={() => {
              setMetadata({
                metadata: {
                  name: `Guest-${Math.random()}`,
                  image: 'ipfs://QmeVRmVLPqUNZUKERq14uXPYbyRoUN7UE8Sha2Q4rT6oyF'
                },
                address: '0x000'
              })
            }}>Enter as Guest</button>
          </center>

        }
        </>
      }

      <center>
        <input type="text" id="textInput" hidden={!initialize} placeholder="Enter a message" />
      </center>

      <Footer ipfs={ipfs} connections={connections}  />

    </center>
  )
}
