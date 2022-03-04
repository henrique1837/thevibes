import { useEffect, useState } from "react";
import * as IPFS from 'ipfs';
function useIpfs() {

  const [ipfs,setIpfs] = useState();

  useEffect( () => {


        IPFS.create({
            EXPERIMENTAL: {
              pubsub: true
            },
            config: {
              Addresses: {
                Swarm: [
                  // Use IPFS dev signal server
                  // Prefer websocket over webrtc
                  //

                  // Websocket:
                  // '/dns4/ws-star-signal-2.servep2p.com/tcp/443//wss/p2p-websocket-star',
                  '/dns4/star.thedisco.zone/tcp/9090/wss/p2p-webrtc-star',
                  '/dns6/star.thedisco.zone/tcp/9090/wss/p2p-webrtc-star',
                  '/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star/'
                  // Local signal server
                  //'/ip4/127.0.0.1/tcp/4711/ws/p2p-websocket-star'
                  //
                  // WebRTC:
                  //'/dns4/star-signal.cloud.ipfs.team/wss/p2p-webrtc-star',
                  // Local signal server
                  // '/ip4/127.0.0.1/tcp/1337/ws/p2p-webrtc-star'
                ]
              },
              API: '',
              Gateway: '',
            }

        })
        .then(async newIpfs => {
          setIpfs(newIpfs)
          for await (const res of newIpfs.name.resolve('/ipns/thehashavatars.com')) {
            await newIpfs.pin.add(res)
            console.log("Dapp pinned!")
          }
          for await (const res of newIpfs.name.resolve('/ipns/snowflakeshash.com')) {
            await newIpfs.pin.add(res)
            console.log("Dapp pinned!")
          }
          for await (const res of newIpfs.name.resolve('/ipns/thevibes.space')) {
            await newIpfs.pin.add(res)
            console.log("Dapp pinned!")
          }
          // Pin contents //
        

          console.log("IPFS started");
      })
      .catch(err => {
        console.log(err)
      });

  },[])



  return({ipfs})
}

export default useIpfs;
