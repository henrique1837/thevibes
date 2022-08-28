import React, { useState, useEffect,useMemo, useRef,useCallback } from 'react'
import { IonPhaser } from '@ion-phaser/react'
import {
  Button,
  Box,
  Header,
  Heading,
  Paragraph,
  TextInput,
  Text,
  Tab,
  Tabs,
  Anchor,
  Spinner
 } from 'grommet';

import {
  useNavigate,
  useParams
} from 'react-router-dom';

import useWeb3Modal from './hooks/useWeb3Modal';
import useClient from './hooks/useGraphClient';
import useIPFS from './hooks/useIPFS';
import authenticateWithEthereum from './hooks/useSelfID.js';
import Room from 'ipfs-pubsub-room';
import { Core } from '@self.id/core'
import Game from './Game';
import Game3D from './Game3D';
import Game3DOnChain from './Game3DOnChain';

import {setAttributes,setTextInput} from './scenes/MainScene';
import {setAttributes as setAttributes3D,setTextInput as setTextInput3D} from './scenes/MainScene3D';
import {setGameProvider} from './scenes/OnChainScene3D/OnChainScene3D';

import FooterComponent from './components/Footer';
import Information from './components/Information';
import Spaces from './components/Spaces';
import ConnectSection from './components/ConnectSection';
import ConnectNFTSection from './components/ConnectNFTSection';
import WalletConnect from './components/WalletConnect'



const topic = 'hash-avatars/games/first-contact';
const core = new Core({ ceramic: 'testnet-clay' })

export default function App () {

  const [graphErr,setGraphErr] = useState();
  const gameRef = useRef(null);
  const {
    provider,
    coinbase,
    netId,
    loadWeb3Modal,
    logoutOfWeb3Modal,
    user,
  } = useWeb3Modal();

  const { ipfs,ipfsErr } = useIPFS();
  const guests = [
    'ipfs://QmeVRmVLPqUNZUKERq14uXPYbyRoUN7UE8Sha2Q4rT6oyF',
    'ipfs://bafybeifkniqdd5nkouwbswhyatrrnx7dv46imnkez4ocxbfsigeijxagsy'
  ]
  const {
      client,
      initiateClient,
      getNftsFrom
  } = useClient();

  const {mapHash,mapName,spaceName,mapTiles} = useParams();
  const navigate = useNavigate();

  const [myOwnedNfts,setMyOwnedNfts] = useState();
  const [myOwnedERC1155,setMyOwnedERC1155] = useState();

  const [loadingMyNFTs,setLoadingMyNFTs] = useState(true);
  const [value,setValue] = useState("TheVibes");

  const [metadataPlayer,setMetadataPlayer] = useState();
  const [initialize, setInitialize] = useState(false);
  const [initialize3d, setInitialize3d] = useState(false);
  const [initialize3dOnChain, setInitialize3dOnChain] = useState(false);

  const [room,setRoom] = useState(0);
  const [connections,setConnectedUsers] = useState(0);

  const [profile,setProfile] = useState();
  const [connectingIDX,setConnectingIDX] = useState(false);
  const [idx,setIDX] = useState();


  const setMetadata = (obj) => {
    if(!obj.metadata.uri){
      obj.metadata.uri = obj.uri
    }
    setMetadataPlayer(obj.metadata);
    if(mapName === "null"){
      let nfts = [];
      if(coinbase && myOwnedNfts && myOwnedERC1155){
        nfts = myOwnedNfts.concat(myOwnedERC1155);
      }
      const scale = mapTiles;
      setAttributes3D(obj.metadata,nfts,coinbase,obj.address,ipfs,mapHash,spaceName,scale)
      setTextInput3D(document.getElementById("textInput"));
      if(spaceName === "chainspace-v0"){
        if(idx){
          setGameProvider(provider,idx);
        } else {
          setGameProvider(provider,core);
        }
        setInitialize3dOnChain(true);
      }
      setInitialize3d(true);
    } else {
      setAttributes(obj.metadata,coinbase,obj.address,ipfs,mapHash,mapName,spaceName,mapTiles);
      setTextInput(document.getElementById("textInput"));
      setInitialize(true);
    }


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

          let returnObj = {
            uri: tokenURI
          }

          if(!tokenURI){
            resolve({});
          }
          if(!tokenURI.includes("://")){
            uri = `https://ipfs.io/ipfs/${tokenURI}`;
          } else if(tokenURI.includes("ipfs://ipfs/")){
            uri = tokenURI.replace("ipfs://ipfs/","https://ipfs.io/ipfs/");
          } else if(tokenURI.includes("ipfs://") && !tokenURI.includes("https://ipfs.io/ipfs/")){
            uri = tokenURI.replace("ipfs://","https://ipfs.io/ipfs/");
          } else if(tokenURI.includes("data:application/json;base64")) {
            uri = tokenURI.replace("data:application/json;base64,","");
          } else {
            uri = tokenURI;
          }
          let metadataToken;
          if(tokenURI.includes("data:application/json;base64")){
            metadataToken = JSON.parse(atob(tokenURI.replace("data:application/json;base64,","")));
          } else {
            metadataToken = JSON.parse(await (await fetch(uri)).text());
          }
          returnObj.address = contractAddress;
          returnObj.metadata = metadataToken;
          resolve(returnObj)
        } catch(err){
          resolve({});
        }
      })
    )
  }

  const connectIDX = useCallback(async () => {
    if(provider && coinbase){
      try{
        setConnectingIDX(true);
        const newIDX = await authenticateWithEthereum(provider.provider,coinbase);
        setIDX(newIDX)
        const newProfile = await newIDX.get('basicProfile');
        setProfile(newProfile);
        setConnectingIDX(false);
      } catch(err){
        console.log(err)
        setConnectingIDX(false);
      }
    }
  },[provider,coinbase]);

  useMemo(() => {
    if(spaceName === "thevibes-space-game-v0"){
      setValue("TheVibes");
    }
    if(spaceName === "badrobots-v0"){
      setValue("CryptoBadRobots")
    }
    if(spaceName === "theSpace3d-v0"){
      setValue("TheVibes3D")
    }
    if(spaceName === "chainspace-v0"){
      setValue("ChainSpace")
    }
  },[spaceName])

  useEffect(() => {
    if(value === "TheVibes"){
      navigate("/!CL_DEMO_32x32/bafybeicr66ob43zu7leqopu45bx3fytchkyd5qv2a6dfcgqc7ewc7skgta/bafkreier6xkncx24wj4wm7td3v2k3ea2r2gpfg2qamtvh7digt27mmyqkm/thevibes-space-game-v0");
    } else if(value === "CryptoBadRobots"){
      navigate("/null/bafybeifa3e4hjhrboeodh5piw6r2ufouks5y5mri3trpe5x7fmxm6p5ulm/1/badrobots-v0")
    } else if(value === "TheVibes3D"){
      navigate("/null/bafybeiho6f7gewdwolfnhuqzkxi2vlla3p6o4qwvzo4ovto434b3bwf7l4/0.1/theSpace3d-v0")
    } else if(value === "ColorNGhosts"){
      navigate("/null/bafybeibresff33jvjkhzoiuryojkvi6i3tpxcj2yv7bvq23i4svvmy435y/1/colorNghosts-v0")
    } else if(value === "ChainSpace"){
      navigate("/null/bafybeiei27ezmaas5ir7ck6qkte77pibhp3vpipqcrvli6w27zbtrj3naq/1/chainspace-v0")
    } else {
      navigate("/!CL_DEMO_32x32/bafybeicr66ob43zu7leqopu45bx3fytchkyd5qv2a6dfcgqc7ewc7skgta/bafkreier6xkncx24wj4wm7td3v2k3ea2r2gpfg2qamtvh7digt27mmyqkm/thevibes-space-game-v0");
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
        if(ownedNfts.data.accounts[0]?.ERC721tokens){
          const erc721Tokens = ownedNfts.data.accounts[0].ERC721tokens;
          promises = erc721Tokens.map(getMetadata);
          const newMyOwnedNfts = await Promise.all(promises)
          console.log(newMyOwnedNfts)
          setMyOwnedNfts(newMyOwnedNfts);
        }

        if(ownedNfts.data.accounts[0]?.ERC1155balances){
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
    if(ipfs && !room){
      console.log(await ipfs.swarm.peers())

      const newRoom = new Room(ipfs, topic);
      newRoom.on('peer joined', async (peer) => {
        console.log('Peer joined the room', peer);
        const newConnections = connections + 1;
        setConnectedUsers(newConnections);
        console.log(await ipfs.swarm.peers())

      })


      newRoom.on('peer left', (peer) => {
        console.log('Peer left...', peer);
        let newConnections = connections - 1;
        if(newConnections < 1){
          newConnections = 1
        }
        setConnectedUsers(newConnections);

      })

      // now started to listen to room
      newRoom.on('subscribed', () => {
        console.log('Now connected!')
      });
      window.addEventListener('unload', function(event) {
        newRoom.leave();
      });
      setInterval(async () => {
        console.log(await ipfs.swarm.peers());
        newRoom.broadcast('alive');
      },15000)
      setRoom(newRoom);

    }

  },[ipfs,connections,room]);

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
            initialize3d && initialize3dOnChain ?
            <>
            {
              ipfs &&
              <>
              <Paragraph>
                Use W to move foward, Q to do onchain action, F to shoot ball, D to interact with player's bases, A to mount base, SPACE to jump and your Mouse to select direction.
                <br />
                Works on desktop.
              </Paragraph>
              {
                netId === 80001 ?
                <IonPhaser ref={gameRef} game={Game3DOnChain()}  initialize={initialize3dOnChain} metadata={metadataPlayer}/> :
                <Paragraph><Anchor href="https://chainlist.network/" target="_blank" rel="noreferrer">Please connect to Mumbai Testnetwork</Anchor></Paragraph>
              }
              </>
            }
            </> :
            initialize3d ?
            <>
            {
              ipfs &&
              <>
              <div>Use WASD, SPACE and your Mouse.<br />Works on mobile and desktop.</div>
              <IonPhaser ref={gameRef} game={Game3D()}  initialize={initialize3d} metadata={metadataPlayer}/>
              </>
            }
            </> :
            <>
            <Header background="brand" align="start">
              <Heading margin="small">The Vibes Beta</Heading>
              <Box align="end" pad="medium" alignContent="center" >
                {
                  coinbase ?
                  <Button onClick={() => {
                    logoutOfWeb3Modal();
                    setIDX();
                    setProfile();
                  }} label="Disconnect" /> :
                  <Button primary onClick={loadWeb3Modal} label="Connect Wallet" />
                }
                {
                  netId && coinbase &&
                  <Text size="xsmall" alignSelf="center" alignContent="center">
                    ChainId: {netId}
                  </Text>
                }
              </Box>
            </Header>
            <Heading level="2">Play for Fun</Heading>
            <Tabs>
              <Tab title="Select Space">
                <Box align="center" pad="medium" alignContent="center" >
                  <Spaces setValue={setValue} value={value} />
                  {
                    !ipfs  && !ipfsErr ?
                    <>
                      <Spinner />
                      <Paragraph>Loading ipfs pubsub ...</Paragraph>
                    </> :
                    ipfsErr ?
                    <Paragraph>Error while loading IPFS, try again later ...</Paragraph> :
                    !coinbase ?
                    <WalletConnect
                      loadWeb3Modal={loadWeb3Modal}
                      setMetadata={setMetadata}
                      guests={guests}
                    /> :
                    <>
                    <Paragraph style={{wordBreak: 'break-word'}}>
                      Connected as {user ? user.user.sub : profile?.name ? profile.name : coinbase}
                    </Paragraph>
                    <Tabs>
                      <Tab title="Use Profile">
                        <ConnectSection
                          guests={guests}
                          coinbase={coinbase}
                          ipfs={ipfs}
                          ipfsErr={ipfsErr}
                          idx={idx}
                          profile={profile}
                          setProfile={setProfile}
                          user={user}
                          connectIDX={connectIDX}
                          connectingIDX={connectingIDX}
                          loadWeb3Modal={loadWeb3Modal}
                          setMetadata={setMetadata}
                          setProfile={setProfile}
                          space={value}
                         />
                      </Tab>
                      <Tab title="Use NFT">
                        <ConnectNFTSection
                           guests={guests}
                           client={client}
                           graphErr={graphErr}
                           loadingMyNFTs={loadingMyNFTs}
                           myOwnedERC1155={myOwnedERC1155}
                           myOwnedNfts={myOwnedNfts}
                           setMetadata={setMetadata}
                           ipfs={ipfs}
                        />
                      </Tab>
                    </Tabs>
                  </>
                  }
                </Box>
              </Tab>
              <Tab title="Information">
                <Information />
              </Tab>
            </Tabs>
            </>
          }
          <Box padding="xlarge" align="center" style={{display: (initialize) ? 'block' : 'none'}}>
            <TextInput
              type="text"
              id="textInput"
              placeholder="Enter a message and press enter to send ..."
            />
          </Box>
          <FooterComponent style={{display: initialize3d ? 'none' : 'block'}} ipfs={ipfs} connections={connections}  />

        </center>
      )
}
