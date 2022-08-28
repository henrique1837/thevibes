import React from 'react'
import {
  Button,
  Spinner,
  Paragraph,
 } from 'grommet';

 import MyNfts from './MyNfts';

export default function ConnectNFTSection(props){
  return(
    <>
    {

      props.loadingMyNFTs && props.client && props.ipfs ?
      <>
        <Spinner />
        <Paragraph>Loading your NFTs ...</Paragraph>
      </>  :
      (!props.graphErr && props.client) && props.ipfs ?
      <>
      <MyNfts myOwnedERC1155={props.myOwnedERC1155} myOwnedNfts={props.myOwnedNfts} setMetadata={props.setMetadata} />
      </>:
      !props.client &&
      props.ipfs &&
      <>
        <Paragraph>Sorry! Could not load your NFTs (subgraph can be syncing), try changing network or enter as guest.</Paragraph>
        <Button primary onClick={() => {
          props.setMetadata({
            metadata: {
              name: `Guest-${Math.round(Math.random()*100000).toString()}`,
              image: props.guests[Math.floor(Math.random()*props.guests.length)]
            },
            address: '0x000'
          })
        }} label="Enter as Guest"/>
      </>

    }
    </>
  )
}
