import React from 'react'
import {
  Box,
  Paragraph,
  Text,
  Anchor,
  Spinner,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Image,
 } from 'grommet';

import makeBlockie from 'ethereum-blockies-base64';


export default function SelfID(props){
  return(
    <>
    {
      !props.idx && !props.connectingIDX && props.coinbase &&
      <Box pad="xxsmall">
        <Button primary onClick={props.connectIDX} label="Connect Self.id" size="small"/>
        <Paragraph size="small">Use this option to play with your <Anchor href={`https://clay.self.id`} target="_blank" size="xxsmall" label="Self.ID" /></Paragraph>
      </Box>
    }
    {
      props.connectingIDX &&
      <Spinner />
    }
    {
      props.profile &&
      <Card  height="medium" width="medium" background="light-1" align="center">
        <CardHeader pad="small"><b>{props.profile.name}</b></CardHeader>
        <CardBody pad="small">
          <Text>
          {
            props.profile?.description
          }
          </Text>
          <Image alignSelf="center" src={
            props.profile.image ?
            props.profile.image.replace("ipfs://","https://ipfs.io/ipfs/") :
            makeBlockie(props.idx.id)
          } width="150px" margin="large"/>
        </CardBody>
        <CardFooter pad={{horizontal: "small"}} background="light-2" align="center" alignContent="center">
          <Button primary onClick={() => {
            props.setMetadata({
              metadata: {
                name: props.profile.name ? props.profile.name : props.coinbase,
                description: props.profile.description,
                image: props.profile.image ?
                       props.profile.image.replace("ipfs://","https://ipfs.io/ipfs/") :
                       makeBlockie(props.idx.id),
                external_url: props.profile.url,
                uri: props.idx.id
              },
              address: props.coinbase
            })
          }} size="small" label="Play using Self.ID" />
        </CardFooter>
      </Card>
    }
    {
      !props.connectingIDX &&
      props.idx &&
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
      }} secondary label="Reload Profile" size="small"/>
      </>
    }

    </>
  )
}
