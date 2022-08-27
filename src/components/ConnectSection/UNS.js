import React from 'react'
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Image,
 } from 'grommet';

export default function UNS(props){
  return(
    <Card  height="medium" width="medium" background="light-1" align="center">
      <CardHeader pad="medium"><b>{props.user.sub}</b></CardHeader>
      <CardBody pad="small"><Image alignSelf="center" src={`https://metadata.unstoppabledomains.com/image-src/${props.user.sub}.svg`} width="250px"/></CardBody>
      <CardFooter pad={{horizontal: "small"}} background="light-2" align="center" alignContent="center">
        <Button secondary onClick={() => {
          props.setMetadata({
            metadata: {
              name: props.user.sub,
              image: `https://metadata.unstoppabledomains.com/image-src/${props.user.sub}.svg`,
            },
            address: props.coinbase
          })
        }} size="small" label="Select" />
      </CardFooter>
    </Card>
  )
}
