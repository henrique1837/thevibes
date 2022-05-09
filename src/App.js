import React, { useState, useEffect,useMemo, useRef } from 'react'
import { IonPhaser } from '@ion-phaser/react'
import {
  Button,
  Box,
  Header,
  Heading,
  Spinner,
  Paragraph,
  Anchor,
  TextInput,
  Select,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Image
 } from 'grommet';

import {
  useLocation,
  useNavigate,
  useParams
} from 'react-router-dom';


import useWeb3Modal from './hooks/useWeb3Modal';
import useClient from './hooks/useGraphClient';
import useIPFS from './hooks/useIPFS';
import Game from './Game';
import {setAttributes,setTextInput} from './scenes/MainScene';

import FooterComponent from './components/Footer';
import MyNfts from './components/MyNfts';



const topic = 'hash-avatars/games/first-contact';

export default function App () {

  const [graphErr,setGraphErr] = useState();

  const gameRef = useRef(null);
  const {
    provider,
    coinbase,
    netId,
    loadWeb3Modal
  } = useWeb3Modal();

  const { ipfs,ipfsErr } = useIPFS();

  const {
      client,
      initiateClient,
      getNftsFrom
  } = useClient();

  const {mapHash,mapName,spaceName,mapTiles} = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [msgs,setMsgs] = useState([]);
  const [myOwnedNfts,setMyOwnedNfts] = useState();
  const [myOwnedERC1155,setMyOwnedERC1155] = useState();

  const [loadingMyNFTs,setLoadingMyNFTs] = useState(true);
  const [value,setValue] = useState("TheVibes");

  const [metadataPlayer,setMetadataPlayer] = useState();
  const [initialize, setInitialize] = useState(false);
  const [subscribed,setSubscribed] = useState();
  const [connections,setConnectedUsers] = useState(0);

  const guests = [
    'ipfs://QmeVRmVLPqUNZUKERq14uXPYbyRoUN7UE8Sha2Q4rT6oyF',
    'ipfs://bafybeifkniqdd5nkouwbswhyatrrnx7dv46imnkez4ocxbfsigeijxagsy'
  ]

  const spaces = [
    {
      name: "TheVibes",
      image : "https://ipfs.io/ipfs/QmeVRmVLPqUNZUKERq14uXPYbyRoUN7UE8Sha2Q4rT6oyF",
      description: "Default Space of TheVibes Space. Originaly done at The HashAvatars",
      path: "/",
      uri: "https://dweb.link/ipns/thehashavatars.crypto",
      tilesetURI: "https://szadiart.itch.io/craftland-demo"
    },
    {
      name: "CryptoBadRobots",
      image : "https://cryptobadrobots-crypto.ipns.dweb.link/config/images/badrobots.jpeg",
      description: "We are Crypto Bad Bots, the new civilization of the world! 🌎🤖",
      path: "/badrobots-v0",
      uri: "https://cryptobadrobots-crypto.ipns.dweb.link/",
      tilesetURI: "https://szadiart.itch.io/postapo-lands-demo"
    }
  ]

  const setMetadata = (obj) => {

    setAttributes(obj.metadata,coinbase,obj.address,ipfs,mapHash,mapName,spaceName,mapTiles);
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
          } else if(tokenURI.includes("data:application/json;base64")) {
            uri = tokenURI.replace("data:application/json;base64,","");
          } else {
            uri = tokenURI;
          }
          let metadataToken;
          if(tokenURI.includes("data:application/json;base64")){
            metadataToken = JSON.parse(atob(uri));
          } else {
            metadataToken = JSON.parse(await (await fetch(uri)).text());
          }
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

  useMemo(() => {
    if(spaceName === "thevibes-space-game-v0"){
      setValue("TheVibes");
    }
    if(spaceName === "badrobots-v0"){
      setValue("CryptoBadRobots")
    }
  },[spaceName])

  useEffect(() => {
    if(value === "TheVibes"){
      navigate("/!CL_DEMO_32x32/bafybeicr66ob43zu7leqopu45bx3fytchkyd5qv2a6dfcgqc7ewc7skgta/bafkreier6xkncx24wj4wm7td3v2k3ea2r2gpfg2qamtvh7digt27mmyqkm/thevibes-space-game-v0");
    }
    if(value === "CryptoBadRobots"){
      navigate("/destruction/bafkreig2opzec3rhplcedyztvorfuls3cqjx3qj3gtrbhemzipf52tm5za/bafkreihakwnufz66i2nmbh3qr7jiri3ulhqwpsc2gimsqzypl4arsuyway/badrobots-v0")
    }
  },[value])

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
      initiateClient(netId);
    }
  },[client,coinbase,netId]);
  useMemo(async () => {
    if(client && coinbase && !myOwnedNfts && netId){
      try{
        const ownedNfts = await getNftsFrom(coinbase,netId);
        let promises;
        if(ownedNfts.data.accounts[0].ERC721tokens){
          const erc721Tokens = ownedNfts.data.accounts[0].ERC721tokens;
          promises = erc721Tokens.map(getMetadata);
          const newMyOwnedNfts = await Promise.all(promises)
          setMyOwnedNfts(newMyOwnedNfts);
        }

        if(ownedNfts.data.accounts[0].ERC1155balances){
          const erc1155Tokens = ownedNfts.data.accounts[0].ERC1155balances;
          promises = erc1155Tokens.map(getMetadata);
          const newMyOwnedERC1155 = await Promise.all(promises)
          setMyOwnedERC1155(newMyOwnedERC1155);
        }

        setLoadingMyNFTs(false);
      } catch(err){
        console.log(err)
        setGraphErr(true)
        setLoadingMyNFTs(false);
      }
    }
  },[client,coinbase,myOwnedNfts,netId]);
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
            <center>

              {
                initialize ?
                <>
                {
                  ipfs && <IonPhaser ref={gameRef} game={Game} initialize={initialize} metadata={metadataPlayer}/>
                }
                </> :
                <>
                <Header background="brand" align="start">
                  <Heading margin="small">The Vibes Beta</Heading>
                </Header>
                <Heading level="2">Play for Fun</Heading>
                <Box align="center" pad="small">
                  <Paragraph>No matter how valuable is your NFT or where it is deployed, here we all have same value!</Paragraph>
                  <Paragraph>Feel free to clone/fork and modify it!</Paragraph>
                  <Paragraph size="small">
                    This game is offchain and does not sends transactions to blockchain, it uses{' '}
                    <Anchor
                      target="_blank"
                      href="https://github.com/ipfs/js-ipfs/blob/master/docs/core-api/PUBSUB.md"
                      label="IPFS pubsub"
                    />{' '}
                    to allow multiplayer
                  </Paragraph>
                  <Paragraph>Select Space</Paragraph>
                  <Select
                      options={["TheVibes","CryptoBadRobots"]}
                      value={value}
                      onChange={({ option }) => {
                        setValue(option)
                      }}
                    />
                  {
                    spaces.map(item => {
                      if(item.name !== value){
                        return;
                      }
                      return(
                        <Card  height="medium" width="small" background="light-1">
                          <CardHeader pad="medium"><b>{item.name}</b></CardHeader>
                          <CardBody pad="small">
                            <Image alignSelf="center" src={item.image} width="150px"/>
                            <Paragraph>{item.description}</Paragraph>
                          </CardBody>
                          <CardFooter pad={{horizontal: "small"}} background="light-2" align="center" alignContent="center">
                            <Anchor href={item.uri} target="_blank" size="small" label="Visit Dapp" />
                            <Anchor href={item.tilesetURI} target="blank" size="small" label="Tileset" />
                          </CardFooter>
                        </Card>
                      )
                    })
                  }
                </Box>
                <Box align="center" pad="medium" alignContent="center">
                {
                  !ipfs  && !ipfsErr ?
                  <>
                    <Spinner />
                    <Paragraph>Loading ipfs pubsub ...</Paragraph>
                  </> :
                  ipfsErr ?
                  <Paragraph>Error while loading IPFS, try again later ...</Paragraph> :
                  !coinbase ?
                  <Box direction="row" alignContent="center" pad="large">
                  <Button primary onClick={loadWeb3Modal} label="Connect Wallet" />
                  <Button primary onClick={() => {
                    setMetadata({
                      metadata: {
                        name: `Guest-${Math.random()}`,
                        image: guests[Math.floor(Math.random()*guests.length)]
                      },
                      address: '0x000'
                    })
                  }} label="Enter as Guest" />
                  </Box> :
                  <>
                  <Paragraph style={{wordBreak: 'break-word'}}>Connected as {coinbase}</Paragraph>
                  </>
                }
                {

                  loadingMyNFTs && ipfs ?
                  <>
                    <Spinner />
                    <Paragraph>Loading your NFTs ...</Paragraph>
                  </>  :
                  coinbase &&
                  (
                    !graphErr && ipfs ?
                    <>
                    <MyNfts myOwnedERC1155={myOwnedERC1155} myOwnedNfts={myOwnedNfts} setMetadata={setMetadata} />
                    </>:
                    ipfs &&
                    <>
                      <Paragraph>Sorry! Could not load your NFTs (subgraph can be syncing), try changing network or enter as guest.</Paragraph>
                      <Button primary onClick={() => {
                        setMetadata({
                          metadata: {
                            name: `Guest-${Math.random()}`,
                            image: 'ipfs://QmeVRmVLPqUNZUKERq14uXPYbyRoUN7UE8Sha2Q4rT6oyF'
                          },
                          address: '0x000'
                        })
                      }} label="Enter as Guest"/>
                    </>
                  )

                }
                </Box>
                </>
              }
              <Box padding="xlarge" align="center" style={{display: !initialize ? 'none' : 'block'}}>
                <TextInput
                  type="text"
                  id="textInput"
                  hidden={!initialize}
                  placeholder="Enter a message and press enter to send ..."
                />
              </Box>
              <FooterComponent ipfs={ipfs} connections={connections}  />

            </center>
      )
}
