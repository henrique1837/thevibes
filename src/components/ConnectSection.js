import React from 'react'
import {
  Button,
  Box,
  Spinner,
  Paragraph,
  Anchor,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Image,
 } from 'grommet';
import makeBlockie from 'ethereum-blockies-base64';

export default function ConnectSection(props){


  return(
    <>
    {
      !props.ipfs  && !props.ipfsErr ?
      <>
        <Spinner />
        <Paragraph>Loading ipfs pubsub ...</Paragraph>
      </> :
      props.ipfsErr ?
      <Paragraph>Error while loading IPFS, try again later ...</Paragraph> :
      !props.coinbase ?
      <Box direction="row" alignContent="center" pad="large">
      <Button primary onClick={props.loadWeb3Modal} label="Connect Wallet" />
      <Button primary onClick={() => {
        props.setMetadata({
          metadata: {
            name: `Guest-${Math.random().toString()}`,
            image: props.guests[Math.floor(Math.random()*props.guests.length)]
          },
          address: '0x000'
        })
      }} label="Enter as Guest" />
      </Box> :
      <>
      <Paragraph style={{wordBreak: 'break-word'}}>
        Connected as {props.user ? props.user.sub : props.profile?.name ? props.profile.name : props.coinbase}
      </Paragraph>
      {
        !props.user && !props.idx && !props.connectingIDX && props.coinbase &&
        <Box pad="xxsmall">
          <Button secondary onClick={props.connectIDX} label="Connect Self.id" size="small"/>
          <Paragraph size="small">Use this option to play with your <Anchor href={`https://clay.self.id`} target="_blank" size="xxsmall" label="Self.ID" /></Paragraph>
        </Box>
      }
      {
        props.connectingIDX &&
        <Spinner />
      }
      <Paragraph>
      {
        !props.user && props.profile?.description
      }
      </Paragraph>
      {
        props.idx && props.coinbase && !props.connectingIDX &&
        <>
        <Paragraph>
          <small>Edit your profile at <Anchor href={`https://clay.self.id/${props.idx.id}`} target="_blank" size="small" label="Self.ID" /></small>
        </Paragraph>
        <Paragraph>
          <small>Explore at <Anchor href={`https://cerscan.com/testnet-clay/profile/${props.idx.id}`} target="_blank" size="small" label="Cerscan" /></small>
        </Paragraph>
        <Button onClick={async () => {
          try{
            //await props.idx.set('basicProfile',{name:"test12121212"});
            const newProfile = await props.idx.get('basicProfile');
            console.log(newProfile)
            props.setProfile(newProfile);
          } catch(err){
            console.log(err)
          }
        }} secondary label="Reload Profile" size="xsmall"/>
        </>
      }
    </>
    }
    {
      props.user ?
      <Card  height="medium" width="medium" background="light-1" align="center">
        <CardHeader pad="medium"><b>{props.user.sub}</b></CardHeader>
        <CardBody pad="small"><Image alignSelf="center" src={`https://metadata.unstoppabledomains.com/image-src/${props.user.sub}.svg`} width="250px"/></CardBody>
        <CardFooter pad={{horizontal: "small"}} background="light-2" align="center" alignContent="center">
          <Button secondary onClick={() => {
            props.setMetadata({
              metadata: {
                name: props.user.sub,
                image: `https://metadata.unstoppabledomains.com/image-src/${props.user.sub}.svg`
              },
              address: props.coinbase
            })
          }} size="small" label="Select" />
        </CardFooter>
      </Card> :
      props.profile &&
      <Card  height="medium" width="medium" background="light-1" align="center">
        <CardHeader pad="medium"><b>{props.profile.name}</b></CardHeader>
        <CardBody pad="small">
          <Image alignSelf="center" src={
            props.profile.image ?
            props.profile.image.replace("ipfs://","https://ipfs.io/ipfs/") :
            makeBlockie(props.idx.id)
          } width="250px"/>
        </CardBody>
        <CardFooter pad={{horizontal: "small"}} background="light-2" align="center" alignContent="center">
          <Button secondary onClick={() => {
            props.setMetadata({
              metadata: {
                name: props.profile.name ? props.profile.name : props.coinbase,
                description: props.profile.description,
                image: props.profile.image ?
                       props.profile.image.replace("ipfs://","https://ipfs.io/ipfs/") :
                       makeBlockie(props.idx.id),
                external_url: props.profile.url
              },
              address: props.coinbase
            })
          }} size="small" label="Play using Self.ID" />
        </CardFooter>
      </Card>
    }
  </>
  )
}
