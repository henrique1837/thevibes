import { useEffect, useState } from "react";

import { Fluence} from "@fluencelabs/fluence";
import { krasnodar } from "@fluencelabs/fluence-network-environment";

import { initTopicAndSubscribeBlocking,findSubscribers,executeOnSubscribers,subscribe } from "../_aqua/export";
import { registerSubscriberAPI, SubscriberAPIDef } from "../_aqua/subscribe";

const topicMovements = 'hash-avatars/games/first-contact/movements';
const topic = 'hash-avatars/games/first-contact';

function useFluence() {

  const [isConnected,setIsConnected] = useState();
  const [relay,setRelay] = useState();
  const [peerId,setPeerId] = useState();

  useEffect(async () => {

    await Fluence.start({ connectTo: krasnodar[0] });
    const newRelay = Fluence.getStatus().relayPeerId;
    const newPeerId = Fluence.getStatus().peerId;
    setRelay(newRelay);
    setPeerId(newPeerId);
    setIsConnected(Fluence.getStatus().isConnected)

  },[])




  return({isConnected,relay,peerId})
}

export default useFluence;
