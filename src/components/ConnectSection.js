import React from 'react';


import SelfID from './ConnectSection/SelfID'
import UNS from './ConnectSection/UNS'

export default function ConnectSection(props){


  return(
    <>
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
