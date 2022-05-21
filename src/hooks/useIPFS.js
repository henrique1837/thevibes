import { useMemo, useState } from "react";
import * as IPFS from 'ipfs';
function useIpfs() {

  const [ipfs,setIpfs] = useState();
  const [ipfsErr,setIpfsErr] = useState();

  useMemo( () => {

    if(!ipfs){

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
                        //'/dns4/star.thedisco.zone/tcp/9090/wss/p2p-webrtc-star',
                        //'/dns6/star.thedisco.zone/tcp/9090/wss/p2p-webrtc-star',
                        '/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star/'
                        // Local signal server
                        //'/ip4/127.0.0.1/tcp/4711/ws/p2p-websocket-star'
                        //
                        // WebRTC:
                        //'/dns4/star-signal.cloud.ipfs.team/wss/p2p-webrtc-star',
                        // Local signal server
                        // '/ip4/127.0.0.1/tcp/1337/ws/p2p-webrtc-star'
                      ],
                      Bootstrap: [
                      "/dns4/ams-1.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLer265NRgSp2LA3dPaeykiS1J6DifTC88f5uVQKNAd",
                      "/dns4/lon-1.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLMeWqB7YGVLJN3pNLQpmmEk35v6wYtsMGLzSr5QBU3",
                      "/dns4/sfo-3.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLPppuBtQSGwKDZT2M73ULpjvfd3aZ6ha4oFGL1KrGM",
                      "/dns4/sgp-1.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLSafTMBsPKadTEgaXctDQVcqN88CNLHXMkTNwMKPnu",
                      "/dns4/nyc-1.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLueR4xBeUbY9WZ9xGUUxunbKWcrNFTDAadQJmocnWm",
                      "/dns4/nyc-2.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLV4Bbm51jM9C4gDYZQ9Cy3U6aXMJDAbzgu2fzaDs64",
                      "/dns4/wss0.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmZMxNdpMkewiVZLMRxaNxUeZpDUb34pWjZ1kZvsd16Zic",
                      "/dns4/wss1.bootstrap.libp2p.io/tcp/443/wss/ipfs/Qmbut9Ywz9YEDrz8ySBSgWyJk41Uvm2QJPhwDJzJyGFsD6"
                      ]
                    },
                    API: '',
                    Gateway: '',
                  }

              })
              .then(async newIpfs => {
                setIpfs(newIpfs)
                console.log("IPFS started");
            })
            .catch(err => {
              console.log(err)
              setIpfsErr(true)
            });
    }

  },[ipfs])



  return({ipfs,ipfsErr})
}

export default useIpfs;
