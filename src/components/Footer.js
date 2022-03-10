import React from 'react'
import { Container,Row,Col,Image,Spinner } from 'react-bootstrap';


export default function Footer (props) {
  return(
    <Container style={{paddingTop: '100px'}}>
      <Row>
        <Col md={2}>
          <p><small><a href="https://phaser.io/" target="_blank" rel="noreferrer">Done with phaser</a></small></p>
        </Col>
        <Col md={2}>
          <p><small><a href="https://thehashavatars.com" target="_blank" rel="noreferrer">Modified from The HashAvatars</a></small></p>
        </Col>
        <Col md={2}>
          <p><small><a href="https://thegraph.com/hosted-service/subgraph/leon-do/polygon-erc721-erc1155" target="_blank" rel="noreferrer">Subgraphs by Leon Du</a></small></p>
        </Col>
        <Col md={2}>
          <p><small><a href="https://github.com/henrique1837/thevibes" target="_blank" rel="noreferrer">Github</a></small></p>
        </Col>
        <Col md={2}>
          <p><small><a href="https://szadiart.itch.io/craftland-demo" target="_blank" rel="noreferrer">Tileset by Szadiart</a></small></p>
        </Col>
        <Col md={2}>
          <p><small><a href="https://fluence.network/" target="_blank" rel="noreferrer">Fluence</a></small></p>
        </Col>
      </Row>
    </Container>
  )
}
