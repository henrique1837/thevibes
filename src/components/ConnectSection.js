import React from 'react'
import {
  Spinner,
  Paragraph,
 } from 'grommet';


import WalletConnect from './ConnectSection/WalletConnect'
import SelfID from './ConnectSection/SelfID'
import UNS from './ConnectSection/UNS'

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
      <WalletConnect
        loadWeb3Modal={props.loadWeb3Modal}
        setMetadata={props.setMetadata}
        guests={props.guests}
      /> :
      <>
      <Paragraph style={{wordBreak: 'break-word'}}>
        Connected as {props.user ? props.user.sub : props.profile?.name ? props.profile.name : props.coinbase}
      </Paragraph>
    </>
    }
    {
      props.user && props.ipfs ?
      <UNS
        coinbase={props.coinbase}
        user={props.user}
        setMetadata={props.setMetadata}
      /> :
      props.coinbase &&
      props.ipfs &&
      <SelfID
        profile={props.profile}
        setMetadata={props.setMetadata}
        idx={props.idx}
        connectingIDX={props.connectingIDX}
        connectIDX={props.connectIDX}
        coinbase={props.coinbase}
      />
    }
  </>
  )
}
