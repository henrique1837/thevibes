import React from 'react'
import {
  Button,
  Box,
 } from 'grommet';

export default function WalletConnect(props){
  return(
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
    </Box>
  )
}
