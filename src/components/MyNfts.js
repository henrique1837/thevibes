import React from 'react'
import { Container,Row,Col,Image,Spinner } from 'react-bootstrap';


export default function MyNfts (props) {
  return(
    <>

    {
      props.myOwnedNfts?.length > 0 &&
      <Container>
      <h5>ERC721</h5>
      <Row style={{textAlign: 'center'}}>
      {
        props.myOwnedNfts?.map(obj => {
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
            <Col style={{paddingTop:'80px'}}>

              <center>
                <div>
                  <p><b>{obj.metadata.name}</b></p>
                </div>
                <div>
                  <Image src={uri} width="150px"/>
                </div>
                <div>
                  <button onClick={() => {props.setMetadata(obj)}} size="small" mode="strong">Select</button>
                </div>
              </center>

            </Col>
          )
        })
      }
      </Row>
      </Container>
    }
    {
      props.myOwnedERC1155?.length > 0 &&
      <Container>
      <h5>ERC1155</h5>
      <Row style={{textAlign: 'center'}}>
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
            <Col style={{paddingTop:'80px'}}>

              <center>
                <div>
                  <p><b>{obj.metadata.name}</b></p>
                </div>
                <div>
                  <Image src={uri} width="150px"/>
                </div>
                <div>
                  <button onClick={() => {props.setMetadata(obj)}} size="small" mode="strong">Select</button>
                </div>
              </center>

            </Col>
          )
        })
      }
      </Row>
      </Container>
    }
    </>
  )
}
