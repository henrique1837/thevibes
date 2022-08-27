import { EthereumAuthProvider, SelfID, WebClient } from '@self.id/web'

export default async function authenticateWithEthereum(provider,coinbase) {

  const authProvider = new EthereumAuthProvider(window.ethereum,coinbase)

  // The following configuration assumes your local node is connected to the Clay testnet
  const client = new WebClient({
    ceramic: 'testnet-clay'	,
    connectNetwork: 'testnet-clay'
  })

  // If authentication is successful, a DID instance is attached to the Ceramic instance
  await client.authenticate(authProvider)

  // A SelfID instance can only be created with an authenticated Ceramic instance
  const self = new SelfID({ client })
  await self.merge('basicProfile',{})
  return(self)
}
