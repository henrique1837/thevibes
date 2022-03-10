import React,{useEffect,useState,useMemo} from 'react'
import { Container,Row,Col,Image,Spinner } from 'react-bootstrap';

import { initTopicAndSubscribeBlocking,findSubscribers } from "../_aqua/export";
import { registerSubscriberAPI, SubscriberAPIDef,send_everyone } from "../_aqua/subscribe";

const topicMovements = 'hash-avatars/games/first-contact/movements';
const topic = 'hash-avatars/games/first-contact';


export default function Chat (props) {
  const [msg,setMsg] = useState();
  const [msgs,setMsgs] = useState([]);
  const post =  async () => {

    const inputMessage = document.getElementById('input_message');
    const obj = {
      message: msg,
      from: props.coinbase,
      timestamp: (new Date()).getTime(),
      metadata: props.metadataPlayer,
      type: "message"
    }
    const msgString = JSON.stringify(obj);
    //const msgToSend = new TextEncoder().encode(msgString)

    //await props.ipfs.pubsub.publish(topic, msgToSend);

    if(!obj.message){
      return
    }
    await send_everyone(topic, msgString)

    inputMessage.value = '';
    inputMessage.innerText = '';
    setMsg('');

  };

  useEffect(async ()=>{
    window.addEventListener('keydown', async event => {
      const inputMessage = document.getElementById('input_message');

      if (event.which === 13) {
        setMsg(inputMessage.value);
        await post();
      }

      if (event.which === 32) {
        if (document.activeElement === inputMessage) {
          inputMessage.value = inputMessage.value + ' ';
          setMsg(inputMessage.value)
        }
      }
    });
    const value = "Subscribed";
    const serviceId = "TheVibesTestDapp-Chat"
    // create topic (if not exists) and subscribe on it
    await initTopicAndSubscribeBlocking(
        topic, value, props.relay, serviceId,
        (s) => console.log(`node ${s} saved the record`)
    );
    await registerSubscriberAPI(serviceId, {
        receive_event: (event) => {
          try{
            const obj = JSON.parse(event);
            if(obj.type === "message"){
              const newMsgs = msgs;
              newMsgs.unshift(obj);
              setMsgs(newMsgs);
              console.log(msgs);
              console.log("event received!", event);

            }
          } catch(err){
            console.log(err)
          }
        }
      });

  },[])


  return(
    <Container>
      <p>Total of {props.peers ? props.peers.length + 1 : 0} players</p>
      <input  placeholder="Message" id='input_message' onChange={(e) => {setMsg(e.target.value);}} onKeyUp={(e) => {setMsg(e.target.value);}} />
      <button onClick={async () => {await post()}}>Send Message</button>
      <Container>
        {
        msgs?.map((obj) => {

          return(
            <Row>
              <Col md={4}>
                <img src={obj.metadata.image.replace("ipfs://","https://ipfs.io/ipfs/")} size='sm'style={{width: '50px'}} />
                <p><small>{obj.metadata.name}</small></p>
              </Col>
              <Col md={8}>
                <p>{obj.message}</p>
              </Col>
            </Row>

          )
        })
      }
      </Container>

    </Container>
  )
}
