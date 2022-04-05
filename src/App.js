import React, { useState, useEffect,useMemo, useRef } from 'react'
import { IonPhaser } from '@ion-phaser/react'
import { Button,Box,Header,Heading,Spinner,Paragraph,Anchor,TextInput } from 'grommet';




import useWeb3Modal from './hooks/useWeb3Modal';
import useClient from './hooks/useGraphClient';
import useWaku from './hooks/useWaku';
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


  const [myOwnedNfts,setMyOwnedNfts] = useState();
  const [myOwnedERC1155,setMyOwnedERC1155] = useState();

  const [loadingMyNFTs,setLoadingMyNFTs] = useState(true);

  const [metadataPlayer,setMetadataPlayer] = useState();
  const [initialize, setInitialize] = useState(false);
  const [subscribed,setSubscribed] = useState();
  const [connections,setConnectedUsers] = useState(0);

  const setMetadata = (obj) => {
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
      initiateClient(netId);
    }
  },[client,coinbase,netId]);
  useMemo(async () => {
    if(client && coinbase && !myOwnedNfts){
      try{
        const ownedNfts = await getNftsFrom(coinbase);
        const erc721Tokens = ownedNfts.data.accounts[0].ERC721tokens;
        let promises = erc721Tokens.map(getMetadata);
        const newMyOwnedNfts = await Promise.all(promises)
        setMyOwnedNfts(newMyOwnedNfts);

        const erc1155Tokens = ownedNfts.data.accounts[0].ERC1155balances;
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
          waku && <IonPhaser ref={gameRef} game={Game} initialize={initialize} metadata={metadataPlayer}/>
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
                image: 'ipfs://QmeVRmVLPqUNZUKERq14uXPYbyRoUN7UE8Sha2Q4rT6oyF'
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

      <Box padding="xlarge">
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
