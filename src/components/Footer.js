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
        {
          props.ipfs ?
          <small><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABmJLR0QA/wD/AP+gvaeTAAAB/klEQVRYhe3XsU5UQRQG4E9M0MRGo6zaGGuBSAVqfA59C15DLEGWUt9EGxLtATFiI3HpsFEUC1yLe2523B12L7ujhfFPJnd25sx//jNn7rmz/EcP03iKA3SwEmN/jXcF3b62UkBAY95OTD7Aw+h3CggYyjuVWTCFc9G/WEBAzZHyZpHbqo9oTeC8FRz9vE9yxtMhooND7Ifx1pgiWrG2G1yHzni4U4JUxDzaeIdvOMIu1jE3Yu1EUWxhAz8NbmndTsKmiPOciC6OsYolXIq2hLWYq+2KOK+xEaSfcHeI3ULYdFVpKoJ51dYeJ86HVbeFsD3BbAkBbVVEq8nYqOr2LMbWSgjYDbLFZGxU1bwXY9ujyHOVsB+34vk2GbuQrK+rW/pu78TzdgP+kThSRXM5fp/HK4MpeBlzcCXGvpQQUKfgPm7iTcZ53V7jhio1jVLQBOtB9hyb0X+PR7iKa3iMvZjbxAuDB3dszKleqTrKPcxk7GbwIbE7wZ0SAugVoi6Wh9gtJ3bFCtF11anuL8WLBkvxj8RuJ9ZO7Hxb70C1/Z6O3Meo3bdmbBGtU4hmVdHu4Gu0bdWu1DnvF97oo5TW9/RCMm4UqYhGF5Jcfd9vqv4UtPQCGetWfDiB8xqfM7yNb8XHBQR8z/BmkUtB9vZ6RjTmTW/Fpf+a/QnefwS/ANmI8WcTkJHBAAAAAElFTkSuQmCC" alt="#" title="Users Connected to the Dapp" /> {props.connections + 1}</small> :
          <small><Spinner animation="border" size="sm" /> Loading ipfs pubsub ...</small>

        }
        </Col>
      </Row>
    </Container>
  )
}
