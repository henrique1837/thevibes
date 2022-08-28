import React,{useState} from 'react'
import {
  Button,
  Box,
  TextInput,
  Text
 } from 'grommet';

import makeBlockie from 'ethereum-blockies-base64';


export default function WalletConnect(props){
  const [value,setValue] = useState();
  return(
    <Box direction="column" alignContent="center" pad="large">
      <Text>Insert IPFS hash of content compatible with nft metadata</Text>
      <TextInput
        placeholder="IPFS Hash"
        value={value}
        onChange={event => setValue(event.target.value)}
      />
      {
        value &&
        <Button primary onClick={() => {
          props.setMetadata({
            metadata: {
              name: props.coinbase,
              image: makeBlockie(props.coinbase),
              uri: value
            },
            address: props.coinbase
          })
        }} label="Enter using wallet" />
      }
    </Box>
  )
}
