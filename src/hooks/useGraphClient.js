import { useEffect, useState } from "react";

// Enter a valid infura key here to avoid being rate limited
// You can get a key for free at https://infura.io/register
import { ApolloClient, InMemoryCache,gql } from '@apollo/client';

const APIURL_XDAI = "https://api.thegraph.com/subgraphs/name/leon-do/xdai-erc721-erc1155";
const APIURL_ETH = "https://api.thegraph.com/subgraphs/name/ryry79261/mainnet-erc721-erc1155";
const APIURL_POLYGON = "https://api.thegraph.com/subgraphs/name/leon-do/polygon-erc721-erc1155";
const APIURL_BSC = "https://api.thegraph.com/subgraphs/name/leon-do/bsc-erc721-erc1155";
const APIURL_AVALANCHE = "https://api.thegraph.com/subgraphs/name/leon-do/avalanche-erc721-erc1155";
const APIURL_RINKEBY = "https://api.thegraph.com/subgraphs/name/leon-do/rinkeby-erc721-erc1155";

function useGraphClient() {
  const [client,setClient] = useState();
  const initiateClient = (netId) => {
    //if(!client && netId){
     let newClient;
     if(netId === 1){
       newClient = new ApolloClient({
         uri: APIURL_ETH,
         cache: new InMemoryCache()
       });
     }
     if(netId === 0x64){
       newClient = new ApolloClient({
         uri: APIURL_XDAI,
         cache: new InMemoryCache()
       });
     }
     if(netId === 137){
       newClient = new ApolloClient({
         uri: APIURL_POLYGON,
         cache: new InMemoryCache()
       });
     }
     if(netId === 56){
       newClient = new ApolloClient({
         uri: APIURL_BSC,
         cache: new InMemoryCache()
       });
     }
     if(netId === 43114){
       newClient = new ApolloClient({
         uri: APIURL_AVALANCHE,
         cache: new InMemoryCache()
       });
     }
     if(netId === 4){
       newClient = new ApolloClient({
         uri: APIURL_RINKEBY,
         cache: new InMemoryCache()
       });
     }
     setClient(newClient);
   //}
 }
 const getNftsFrom = async (address) => {
   const tokensQuery = `
      query {
        accounts(where: {id: "${address.toLowerCase()}"}) {
          id
          ERC721tokens {
            id,
            uri
          }
          ERC1155balances{
            id
            value
            token {
              id
              uri
            }
          }
        }
      }
   `;
   const results = await client.query({
     query: gql(tokensQuery)
   });
   return(results);
 }
 return({client,initiateClient,getNftsFrom})
}

export default useGraphClient;
