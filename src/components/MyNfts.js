import React from 'react'
import {
  Button,
  Box,
  Heading,
  Image,
  Paragraph,
  Card,
  CardHeader,
  CardBody,
  CardFooter
 } from 'grommet';


export default function MyNfts (props) {
  return(
    <>
    {
      props.myOwnedNfts?.length > 0 &&
      <>
      <Heading level="5">ERC721</Heading>
      <Box alignContent="center" align="center" pad="medium" direction="row-responsive" wrap={true}>
      {
        props.myOwnedNfts?.map(obj => {
          if(!obj.metadata?.image && !obj.metadata?.image_data){
            return;
          }
          console.log(obj.metadata)
          let tokenURI = obj.metadata.image;
          if(!tokenURI){
            tokenURI = obj.metada.image_data;
          }
          let uri;
          if(!tokenURI.includes("://")){
            uri = `https://ipfs.io/ipfs/${tokenURI}`;
          } else if(tokenURI.includes("ipfs://") && !tokenURI.includes("https://ipfs.io/ipfs/")){
            uri = tokenURI.replace("ipfs://","https://ipfs.io/ipfs/");
          } else {
            uri = tokenURI
          }
          return(
            <Card  height="medium" width="small" background="light-1">
              <CardHeader pad="medium"><b>{obj.metadata.name}</b></CardHeader>
              <CardBody pad="small"><Image alignSelf="center" src={uri} width="150px"/></CardBody>
              <CardFooter pad={{horizontal: "small"}} background="light-2" align="center" alignContent="center">
                <Button secondary onClick={() => {props.setMetadata(obj)}} size="small" label="Select" />
              </CardFooter>
            </Card>
          )
        })
      }
      </Box>
      </>
    }
    {
      props.myOwnedERC1155?.length > 0 &&
      <>
      <Heading level="5">ERC1155</Heading>
      <Box alignContent="center" align="center" pad="medium" direction="row-responsive" wrap={true}>
      {
        props.myOwnedERC1155?.map(obj => {
          if(!obj.metadata?.image){
            return;
          }
          let tokenURI = obj.metadata.image;
          let uri;
          if(!tokenURI.includes("://")){
            uri = `https://ipfs.io/ipfs/${tokenURI}`;
          } else if(tokenURI.includes("ipfs://") && !tokenURI.includes("https://ipfs.io/ipfs/")){
            uri = tokenURI.replace("ipfs://","https://ipfs.io/ipfs/");
          } else {
            uri = tokenURI
          }
          return(
            <Card  height="medium" width="small" background="light-1">
              <CardHeader pad="medium"><b>{obj.metadata.name}</b></CardHeader>
              <CardBody pad="small"><Image alignSelf="center" src={uri} width="150px"/></CardBody>
              <CardFooter pad={{horizontal: "large"}} background="light-2" align="center" alignContent="center">
                <Button secondary onClick={() => {props.setMetadata(obj)}} size="small" label="Select"/>
              </CardFooter>
            </Card>
          )
        })
      }
      </Box>
      </>
    }
    </>
  )
}
