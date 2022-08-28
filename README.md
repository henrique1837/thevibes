# TheVibes Space

A place where NFTs can play togheter and have fun. Currently playable with NFTs from  Rinkeby, Ethereum, BSC, Avalanche, XDAI, Polygon and Boba network.

Users can also enter as guest (no NFT in wallet / not connected the wallet to the dapp).

Proof of concept collection of offchain Free to Play (Play for Fun!) games done with [Phaser](https://phaser.io/)/[Enable3D](https://enable3d.io/) using [IPFS pubsub](https://github.com/ipfs/js-ipfs/blob/master/docs/core-api/PUBSUB.md) to allow chat messages between players and show positions/movements in the game.


2D Maps were done using tiles from [itch.io](https://itch.io/game-assets/free/tag-tileset) and generated using [map editor](https://www.mapeditor.org/).


3D spaces done with [Enable3D](https://enable3d.io/), scenarios from [sketchfab](https://sketchfab.com/3d-models/low-poly-office-building-1-c4970cbcb82746fb8c107875e789e270)


NFTs lists were get using https://thegraph.com/hosted-service/subgraph/leon-do/xdai-erc721-erc1155 and https://api.thegraph.com/subgraphs/name/quantumlyy/eip721-subgraph-matic (and theirs networks);

Included [UNS Login](https://docs.unstoppabledomains.com/login-with-unstoppable/), user can use its domain as character.

Included [Self.ID SDK](https://developers.ceramic.network/reference/self-id/) to allow users use its [Self.ID](https://clay.self.id/) profile as character and save base's position in the space.

ChainSpace, the first onchain space of TheVibes Space, uses [Chainlink VRF](https://docs.chain.link/docs/chainlink-vrf/) at Mumbai Testnetwork to trigger an action in the game based in the result of the number generated.

## ChainSpace (VRF consumer) Demo Video



## UNS Login Demo Video

  https://bafybeibh2ht5h3amo7hrmanxswa5mayi5z6itorp6g7skfaehdvzkhcdqm.ipfs.nftstorage.link/

## Demo Video

  https://bafybeif2myhdjkp6wa7dww7dyfztdpixdmihlueozpqi6fe22acpssgjze.ipfs.nftstorage.link/


## Demo

Any of URLs

 - https://thevibes--space-crypto.ipns.dweb.link/
 - https://gateway.pinata.cloud/ipns/thevibes-space.crypto/
 - https://ipfs.io/ipns/thevibes-space.crypto/
 - ipns://thevibes-space.crypto/
 - https://cool-art-1434.on.fleek.co/

## Contact

  - Discord: bongador#2753
  - UNS Email: bongador@protonmail.com

## Testing Guide


<details>
<summary style="font-size:24px"><b>Basic 2D</b></summary>

#### Controls
  - Arrows keys: move
  - Enter: send message

### As Guest

  This option can be used by users that does not have NFTs or wallet.

 - Enter the dapp, wait for IPFS load and click "Enter as Guest" button;

 ![Main](https://ipfs.io/ipfs/bafybeiclmddnvdbs3netka3nydfv6nnx52dxwjqgdqhcfwsopjhg2wutxe/main.png "Main")

 - Move using arrows keys

 ![Guest](https://ipfs.io/ipfs/bafybeiclmddnvdbs3netka3nydfv6nnx52dxwjqgdqhcfwsopjhg2wutxe/guest.png "Guest")


### Using NFT

  - Connect wallet in the dapp and wait NFTs load (Currently playable with NFTs from  Rinkeby, Ethereum, BSC, Avalanche, XDAI, Polygon but some subgraphs may not be 100% synced with the blockchain)

  - Select your NFT

  ![Select NFT](https://ipfs.io/ipfs/bafybeiclmddnvdbs3netka3nydfv6nnx52dxwjqgdqhcfwsopjhg2wutxe/connected.png "Select NFT")


  - Move using arrows keys, touch the top of others to kill them, NFTs from same contract address or guests cant kill each other .

  ![NFT](https://ipfs.io/ipfs/bafybeiclmddnvdbs3netka3nydfv6nnx52dxwjqgdqhcfwsopjhg2wutxe/nftUse.png "NFT")

  ![Guest Died](https://ipfs.io/ipfs/bafybeiclmddnvdbs3netka3nydfv6nnx52dxwjqgdqhcfwsopjhg2wutxe/guestDied.png "Guest Died")

</details>

<details>
<summary style="font-size:24px"><b>Basic 3D</b></summary>

#### Controls
  - Mouse: point direction
  - W: move forward
  - A: place base
  - D: Go to external url of near base
  - F: Shoot

</details>

<details>

<summary style="font-size:24px"><b>ChainSpace</b></summary>

#### Controls
  - Mouse: point direction
  - W: move forward
  - A: place base
  - D: Go to external url of near base
  - F: Shoot
  - Q: Interact with game contract

</details>

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
