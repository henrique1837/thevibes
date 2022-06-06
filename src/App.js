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
  useNavigate,
  useParams
} from 'react-router-dom';

import useWeb3Modal from './hooks/useWeb3Modal';
import useClient from './hooks/useGraphClient';
import useIPFS from './hooks/useIPFS';
import Room from 'ipfs-pubsub-room';

import Game from './Game';
import Game3D from './Game3D';

import {setAttributes,setTextInput} from './scenes/MainScene';
import {setAttributes as setAttributes3D,setTextInput as setTextInput3D} from './scenes/MainScene3D';

import FooterComponent from './components/Footer';
import MyNfts from './components/MyNfts';



const topic = 'hash-avatars/games/first-contact';

export default function App () {

  const [graphErr,setGraphErr] = useState();
  const gameRef = useRef(null);
  const {
    coinbase,
    netId,
    loadWeb3Modal,
    user
  } = useWeb3Modal();

  const { ipfs,ipfsErr } = useIPFS();

  const {
      client,
      initiateClient,
      getNftsFrom
  } = useClient();

  const {mapHash,mapName,spaceName,mapTiles} = useParams();
  const navigate = useNavigate();

  const [msgs,setMsgs] = useState([]);
  const [myOwnedNfts,setMyOwnedNfts] = useState();
  const [myOwnedERC1155,setMyOwnedERC1155] = useState();

  const [loadingMyNFTs,setLoadingMyNFTs] = useState(true);
  const [value,setValue] = useState("TheVibes");

  const [metadataPlayer,setMetadataPlayer] = useState();
  const [initialize, setInitialize] = useState(false);
  const [initialize3d, setInitialize3d] = useState(false);

  const [subscribed,setSubscribed] = useState();
  const [connections,setConnectedUsers] = useState(0);
  //const [peers,setPeers] = useState(0);

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
    },
    {
      name: "TheVibes3D",
      image : "https://ipfs.io/ipfs/bafkreiaui7kqyj22m7m6lbt22l3w3kfkhxxfz33f5vgpryalegp35q7k7m",
      description: "TheVibes Space done with enable3d",
      path: "/thespace3d-v0",
      uri: "https://dweb.link/ipns/snowflakeshash.crypto",
      tilesetURI: "https://sketchfab.com/3d-models/low-poly-scene-forest-waterfall-536a2db7384145c9aff9bfdfe2aeb5ab"
    },
    {
      name: "ColorNGhosts",
      image : "data:image/svg+xml;base64,PHN2ZyBpZD0nYScgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJyB2aWV3Qm94PScwIDAgODIuNjYzNjQgNjkuMTg3MTUnPjxkZWZzPjxsaW5lYXJHcmFkaWVudCBpZD0nZycgeDE9JzAnIHgyPScxJyB5MT0nMCcgeTI9JzEnIHNwcmVhZE1ldGhvZD0ncGFkJz48c3RvcCBvZmZzZXQ9JzAlJyBzdG9wLWNvbG9yPSdyZ2IoMjMsMTM3LDIxMCknLz4gPHN0b3Agb2Zmc2V0PSc1MCUnIHN0b3AtY29sb3I9J3JnYigyMTAsMjMsMTIxKScvPiA8c3RvcCBvZmZzZXQ9JzEwMCUnIHN0b3AtY29sb3I9J3JnYigxMzcsMTIxLDIzKScvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxwYXRoIGZpbGw9J3VybCgjZyknIGQ9J003Ny44MTA2NiwyMC41NzI1MmMtNC43MzEwMi03LjMxNDc2LTEwLjQ3ODUyLTcuMjIzMTQtMTQuNzYzNTUtNi42ODQwMi01LjY4NjIyLC43MTUzOS0xMC41NjMxMSw0LjU4NTQ1LTEyLjY0MDAxLDkuOTI2OTQsMCwwLTEuNjk5MjgsNC41NTE3LTEuNjk5MjgsMTIuNjcyMThsLS4wMDA0OSwuMDAwNjFjLjA4ODY4LC44MDg2NS0uMzU1MzUsOC45NzQ3OS0uMzU1MzUsOC45NzQ3OS0uMjA2MTgsMy41NzIxNC0uOTQxMjIsNy4wNzU2Mi0yLjg5MzI1LDEwLjEyNDQ1LS40NDExNiwuNjg5MTUtMi44MDA5NiwzLjY1OTM2LTIuODAwOTYsMy42NTkzNi0xLjk1MDc0LDIuNDAxNDMtMS40NDUxOSwyLjQwMTI1LTEuNDQ1MTksMi40MDEyNSwxLjcwNTMyLDMuMzkxMDUsNS4zMDA0Miw1LjAzMjk2LDguOTQ1NjIsMy44NTc0MiwwLDAsMS4xMDg0Ni0uMzk3NzcsMi4wNDYxNC0uNDUwNjgsMi4xMzUxOS0uMTIwNDIsNC4wNDIyNCwuMzI0ODksNS43ODQ4NSwxLjkyNTIzLDIuODgyODcsMi42NDczNCw2LjA4NjM2LDIuNzM5MjYsOS40NDQ1MiwxLjE5NjQ3LDEuNjk3MzMtLjc3OTg1LDMuNDAwNjMtMS4zMjQ4Myw1LjE1NTMzLTEuMjg2NSwuMzQ0NDIsLjAwNzUxLC42OTExNiwuMDQwNDcsMS4wNDAwNCwuMDk2OTIsLjUwNjk2LC4wODIwOSwxLjAxNzQsLjIwMTY2LDEuNTM1NjQsLjQwMTk4LDEuMTk2MTcsLjQ2MjM0LDIuMzI2NjYsMS4wOTQ0MiwzLjczMjU0LDEuNzY2OTEsMCwwLDMuMjkxNzUtMTIuNjYzNywzLjcxMTI0LTIyLjI1NzQ1LC4wNTQwMi0xLjczMjYsLjA1OTUxLTMuNDY2OCwuMDUyOTItNS4yMDQ5LS4wNTI5Mi0xMy45NTQxNi00Ljg1MDc3LTIxLjEyMDk3LTQuODUwNzctMjEuMTIwOTdaTTQyLjY2OTkxLDU5LjI0OTE1IE0zNy4zNjM4Miw0MS43NDYyMmMtMS4xNTUxNS0xLjc4MTY4LTIuMDY2ODMtMy42NTA1MS0yLjY2NjA4LTUuNjMwNjgtMS4zNjEyNy00LjQ5ODQxLTEuMzkxNzItMTMuNDQzNzMtMS4zOTE3Mi0xMy40NDM3My0uMDQzMTUtMy4wNDAxNi0uMjEzNTYtNi4wODU1Ny0uNjU0NzItOS4wNzQ5NS0uMDk0OTEtLjY0Mjc2LS4yMzEyLTEuMjY1MjYtLjM4NzUxLTEuODc2NzdsLS4wMDI4MS0uMDExMTFjLS44MDM4OS0zLjEzNjYtMi40MTIxNy01LjgyNjY2LTQuNjk4NjEtNy44MzQ5NmwtLjAwMDQzLS4wMDAzMWMtLjY2Mzk0LS41ODMxMy0xLjM3NzItMS4xMTY3Ni0yLjE1NDMtMS41NzcyN2wtLjAzMjY1LS4wMTg2OGMtMS42Mzk1My0uOTY1ODgtMy41MTU0NC0xLjY1NDE3LTUuNjE3NDMtMS45ODgyOEMxNS44NTIxNi0uMzMxMjksMTIuMTI3NjctLjA2MjQzLDguNzMwNzYsMi4xNzI2OGMtMi44NzI4LDEuODkwMi00LjY2NjUsNC41NjcwMi01LjkxMzIxLDcuNjA3MTgtLjIxMjI4LC41MTc1OC0uNDEzNTEsMS4wNDI0OC0uNTk2MzcsMS41NzkyMi0uMzU0OTgsMS4wNDE5OS0uNjQ4NDQsMi4wOTMzOC0uOTEwNTgsMy4xNDkzNWwtLjAxMDE5LC4wNDA0MUMtLjQwNTIyLDIxLjg2Nzc0LC4wNTU0MSwyNy45NDI2MywuMDU5OTksMjguMDc1MDJjMCwwLC4wMjQ5LDQuNjIzNDcsLjY0NTM5LDguODc1NzMsLjA0MzI3LC4yOTY2OSwuMDg1NTcsLjU5MzY5LC4xMjcxNCwuODkwNjksMS4yMDY1NCwxMC4wNTg5NiwzLjQyODY1LDE1LjkzMDczLDMuNDI4NjUsMTUuOTMwNzMsLjMyNzg4LS4xNzMwMywuNDYyMjItLjIyODM5LC41Nzk3Ny0uMzA4MjksMy4wNjQzMy0yLjA4Mzg2LDYuMjM1OTYtMi41OTM4MSw5LjY5ODYxLS45MjE2OWwyLjU2NzU3LC45MjM0YzIuNjQxMTcsLjYyMDA2LDUuMTY1NDEsLjA4NDU5LDcuNTM5NDktMi4xMzMzLDEuODY4OS0xLjc0NTk3LDQuMTcxMDgtMi4yMjU4OSw2Ljc1MjAxLTEuNjA2NzUsMCwwLDcuMzk2NDIsMS4xMTQzMiw5LjMwODIzLTMuNzkzOTUsMCwwLTEuNjc0MDctMS41Mjc4OS0zLjM0MzAyLTQuMTg1MzZaJy8+PGc+PHBhdGggZmlsbD0ncmdiKDMwLDMwLDMwKScgZD0nTTUzLjk1MzUsMjguOTgyODNjLS42OTg0NCwuMDYyODMtMS4xNDY4NSwuNTk0NDEtMS4xMzU2MywxLjM0Nzc2LC4wMDUxNSwuMzQwMzgsLjA1MjEzLC42ODAxNiwuMDgwMTEsMS4wMjAxNmwuMDA0NTEtLjAwMDI5Yy4wMzAzNCwuMzY4MzIsLjAzMTgsLjc0MTg4LC4wOTcwOCwxLjEwMzk0LC4xMjkxOSwuNzE2OTUsLjU4NzE5LDEuMTAyOTYsMS4zMTM0OCwxLjA3MzgzLC43MzIyLS4wMjk0MSwxLjE5NTYyLS40Nzg2OCwxLjIxNjE4LTEuMTg0NiwuMDIzMDUtLjc5MDQzLS4wNDMyOC0xLjU5NzcxLS4xOTIwMS0yLjM3NDQ1LS4xMzIyOS0uNjkwNjMtLjY0NjU2LTEuMDUyNzEtMS4zODM3Mi0uOTg2MzRaIE02OS4wNTYzOSwzMC4wMDYzN2MtLjU1MjktLjQ3NzcxLTEuMjgzNC0uMzk1MS0xLjg5NTE4LC4yMTQzNS0xLjE0MDc0LDEuMTM2MzEtMi4yMzkzNiwxLjIyMzktMy41NjU3MywuMjg0MzItLjcwMzUxLS40OTg0Ny0xLjQzNjg3LS40NTI4OS0xLjkwMjA1LC4xMTgxNy0uNDg1MDksLjU5NTM4LS4zOTY5NCwxLjI5MTM1LC4yNjQ5OCwxLjg3NzIsLjU5NDMxLC41MjYxMSwxLjI1NDIzLC44NjAwOSwxLjk2MTM2LDEuMDQ2NzQsLjE4NDcxLC4wNDg3OSwuMzcyNDgsLjA4OCwuNTYzNjMsLjExNjUxLC4zNzkwNSwuMDU2NDIsLjc2ODczLC4wNzkwMywxLjE2OTk1LC4wNjI3MiwxLjM2Mzk5LS4xNzAyMywyLjUyODAxLS43MDE0NiwzLjQxNTY2LTEuNzU2MzMsLjMxMzk2LS4zNzMxOSwuNDU1NjEtLjc1MTU1LC40MzcyMy0xLjEwMjQ5LS4wMDY5MS0uMTMxMzYtLjAzNzQ4LS4yNTgzNS0uMDkwMzMtLjM3OTk4LS4wNzUyNi0uMTczNDMtLjE5MTkxLS4zMzY0NC0uMzU5NTQtLjQ4MTIyWiBNNzcuODY1MDEsMjkuMzQ0M2MtLjAzMDI3LS4zNjgzMi0uMDM2MjctLjc0MDY4LS4wOTYxMS0xLjEwNDIyLS4xMTc3Mi0uNzE1NjEtLjU1NDIzLTEuMTA1MTItMS4yODcxOS0xLjEwNzA3LS4xMjc5MS0uMDAwMy0uMjQ4ODUsLjAyMjE2LS4zNjUxNCwuMDU0NzEtLjIwMjM1LC4wNTY2OS0uMzg1MzUsLjE1NTA5LS41MzAzOCwuMjk1MjQtLjIyNjY0LC4yMTkwMy0uMzY2MjQsLjUyNzE5LS4zNjQ0OCwuODg1ODQsLjAwMzcyLC43NjUxMSwuMDU0OTEsMS41NDAyMiwuMTkyMywyLjI5MTUsLjEyNzE1LC42OTUyOCwuNjMwMDksMS4wNjc3NSwxLjM2MTMyLDEuMDI3MjUsLjY5NjA2LS4wMzg2MiwxLjE3MTA1LS41ODEwMywxLjE2ODk5LTEuMzIzMTgtLjAwMDk5LS4zNDAxMS0uMDUxMzktLjY4MDA2LS4wNzkzMS0xLjAyMDA3WiBNNy43NjUwMiwxMS43NDE5Yy0xLjczOTg5LS4wNDc2Ny0zLjMwODg5LDEuNDAzNTctMy4zMjI4NiwzLjA3MzQyLS4wMDY5NywuODM4NTQsLjY4MTMxLDEuMzkyNCwxLjQzODY0LDEuMTQ2ODUsLjUwMDU1LS4xNjIzNSwuNjYzMzQtLjU2MDMxLC43NjY0OC0xLjA0NTUyLC4xNzM3NC0uODE3NjcsLjg2NTUzLTEuMTc0NjksMS41MDk0OC0uODI2MTksLjQxMDQ4LC4yMjIxNCwuNDg4NjksLjYxNDE0LC41NTc3NCwxLjAzNjMzLC4xMTgzOCwuNzI0MzIsLjYxMjQ2LDEuMDk2MywxLjI1Nzc5LDEuMDA0MTIsLjU4NDU2LS4wODM1MSwuOTYyMS0uNTk3MzUsLjkzMzc5LTEuMjcxMTItLjA3MTAzLTEuNjg5NTYtMS40NjM2Ni0zLjA3MTk2LTMuMTQxMDUtMy4xMTc4OFogTTE4LjU2NTU4LDE3LjEzNjAxYy0xLjA4NzEyLC44NDg0NC0xLjgyOTAxLC44MTczNi0yLjg4MzY5LS4xMjA5Mi0uMjI2MDMtLjIwMTA5LS40NTc0LS4zMDI0Mi0uNjg0NzItLjM0NTU4LS42MzY4My0uMTE3NC0xLjAwMjYyLC40MTI2My0xLjAwMjYyLC40MTI2My0uMzM1ODUsLjQzNDM0LS4zMDU4NywxLjAxMTMxLC4xNDM3NiwxLjUwMjg3LC43NTAzMiwuODIwMTUsMS42ODIxNywxLjI3Njg0LDIuNzk5OTEsMS4zMzM1NiwxLjE5OTIyLC4wNzIyOSwyLjIzNTk4LS4zMTE1MiwzLjA5NzI1LTEuMTQyMDEsLjUxNDc2LS40OTYzOSwuNTU3MTktMS4xNTM0OCwuMTQxMTEtMS42MTUxMS0uNDMzNzUtLjQ4MTEtMS4wMTU0My0uNDkwMzEtMS42MTEwMS0uMDI1NDNaIE0yOS45NTMyNCwxNS40NDM5Yy0uMTAyNjEtMS42NDE1MS0xLjUxMDkxLTIuOTkzMi0zLjE1NTE5LTMuMDI4MzMtMS41ODI3Mi0uMDMzODItMi45Mjk2MSwxLjA3MDEyLTMuMjQ5MzUsMi42NjMyMy0uMTYyNTEsLjgwOTYzLC4xMzkwNCwxLjQxMTc1LC43ODA0OSwxLjU1ODczLC42NzI3MiwuMTU0MTMsMS4xODA3Mi0uMjA3MTcsMS4zNjc3My0xLjAzODI5LC4xMzU4My0uNjAzODksLjQ0NTg4LS45NzEyOCwxLjA4NDA1LS45Mzg3LC42NDc1NSwuMDMzMDksLjg5NDc5LC40NzIxNiwuOTg2NjEsMS4wNTkxLC4xMjY4MywuODExNTgsLjU1MTgsMS4xODI2MiwxLjIyNTM3LDEuMTA3MDksLjY0OTc4LS4wNzI4NCwxLjAwOTc0LS41OTEyOCwuOTYwMjktMS4zODI4M1onLz48L2c+PC9zdmc+",
      description: "BUUU",
      path: "/colorghosts-v0",
      uri: "https://bafybeifjjnfg5gzqsyxc7hdmuv3xkd4dkgvfpmovof5jn2id5gtgbx4xqi.ipfs.infura-ipfs.io",
      tilesetURI: "https://sketchfab.com/3d-models/coastal-city-and-the-forest-around-tree-of-life-1ab542ed5cb44e479eb3ea828c501b10"
    }
  ]

  const setMetadata = (obj) => {

    setMetadataPlayer(obj.metadata);
    if(mapName === "null"){
      let nfts = [];
      if(coinbase){
        nfts = myOwnedNfts.concat(myOwnedERC1155);
      }
      const scale = mapTiles;
      setAttributes3D(obj.metadata,nfts,coinbase,obj.address,ipfs,mapHash,mapName,spaceName,scale)
      setTextInput3D(document.getElementById("textInput"));
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
          console.log(tokenURI)
          let metadataToken;
          if(tokenURI.includes("data:application/json;base64")){
            metadataToken = JSON.parse(atob(tokenURI.replace("data:application/json;base64,","")));
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
    if(spaceName === "theSpace3d-v0"){
      setValue("TheVibes3D")
    }
  },[spaceName])

  useEffect(() => {
    if(value === "TheVibes"){
      navigate("/!CL_DEMO_32x32/bafybeicr66ob43zu7leqopu45bx3fytchkyd5qv2a6dfcgqc7ewc7skgta/bafkreier6xkncx24wj4wm7td3v2k3ea2r2gpfg2qamtvh7digt27mmyqkm/thevibes-space-game-v0");
    } else if(value === "CryptoBadRobots"){
      navigate("/destruction/bafkreig2opzec3rhplcedyztvorfuls3cqjx3qj3gtrbhemzipf52tm5za/bafkreihakwnufz66i2nmbh3qr7jiri3ulhqwpsc2gimsqzypl4arsuyway/badrobots-v0")
    } else if(value === "TheVibes3D"){
      navigate("/null/bafybeiho6f7gewdwolfnhuqzkxi2vlla3p6o4qwvzo4ovto434b3bwf7l4/0.1/theSpace3d-v0")
    } else if(value === "ColorNGhosts"){
      navigate("/null/bafybeibresff33jvjkhzoiuryojkvi6i3tpxcj2yv7bvq23i4svvmy435y/1/colorNghosts-v0")
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
        if(ownedNfts.data.accounts[0].ERC721tokens){
          const erc721Tokens = ownedNfts.data.accounts[0].ERC721tokens;
          promises = erc721Tokens.map(getMetadata);
          const newMyOwnedNfts = await Promise.all(promises)
          console.log(newMyOwnedNfts)
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
      const id = await ipfs.id();
      console.log(await ipfs.swarm.peers())

      const room = new Room(ipfs, topic);
      room.on('peer joined', async (peer) => {
        console.log('Peer joined the room', peer);
        const newConnections = connections + 1;
        setConnectedUsers(newConnections);
        console.log(await ipfs.swarm.peers())

      })


      room.on('peer left', (peer) => {
        console.log('Peer left...', peer);
        const newConnections = connections - 1;
        setConnectedUsers(newConnections);

      })

      // now started to listen to room
      room.on('subscribed', () => {
        console.log('Now connected!')
      });
      window.addEventListener('unload', function(event) {
        room.leave();
      });
      setInterval(async () => {
        console.log(await ipfs.swarm.peers());
        room.broadcast('alive');
      },15000)


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
                  options={["TheVibes","CryptoBadRobots","TheVibes3D","ColorNGhosts"]}
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
                        {
                          item.uri &&
                          <Anchor href={item.uri} target="_blank" size="small" label="Visit Dapp" />
                        }
                        {
                          item.tilesetURI &&
                          <Anchor href={item.tilesetURI} target="blank" size="small" label="Tileset" />
                        }
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
                    name: `Guest-${Math.random().toString()}`,
                    image: guests[Math.floor(Math.random()*guests.length)]
                  },
                  address: '0x000'
                })
              }} label="Enter as Guest" />
              </Box> :
              <>
              <Paragraph style={{wordBreak: 'break-word'}}>Connected as {user ? user.sub : coinbase}</Paragraph>
              {
                user &&
                <Card  height="medium" width="medium" background="light-1" align="center">
                  <CardHeader pad="medium"><b>{user.sub}</b></CardHeader>
                  <CardBody pad="small"><Image alignSelf="center" src={`https://metadata.unstoppabledomains.com/image-src/${user.sub}.svg`} width="250px"/></CardBody>
                  <CardFooter pad={{horizontal: "small"}} background="light-2" align="center" alignContent="center">
                    <Button secondary onClick={() => {
                      setMetadata({
                        metadata: {
                          name: user.sub,
                          image: `https://metadata.unstoppabledomains.com/image-src/${user.sub}.svg`
                        },
                        address: '0xa9a6a3626993d487d2dbda3173cf58ca1a9d9e9f'
                      })
                    }} size="small" label="Select" />
                  </CardFooter>
                </Card>
              }
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
                        name: `Guest-${Math.round(Math.random()*100000).toString()}`,
                        image: guests[Math.floor(Math.random()*guests.length)]
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
