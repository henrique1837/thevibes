import React from 'react'
import {
  Box,
  Paragraph,
  Anchor,
 } from 'grommet';

export default function Information() {
  return(
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
  )
}
