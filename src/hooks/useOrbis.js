import { useState } from "react";
/** Import Orbis SDK */
import { Orbis } from "@orbisclub/orbis-sdk";

/** Initialize the Orbis class object */
const orbis = new Orbis();

function useOrbis() {
  const [orbisClient, setOrbisClient] = useState();



  const connectSeed = async (seed) => {
    if(orbisClient){
      await orbis.logout()
    }
    orbis.connectWithSeed(seed).then(async res => {
      setOrbisClient(res);
    });


  }

  const addWallet = async (address, sessionId) => {
    const profile = await orbis.getProfile(orbisClient.did);
    let data = profile.data?.details.profile.data;
    if (!data) {
      data = {}
    }
    data[address.toLowerCase()] = sessionId;
    await orbis.updateProfile({
      data: data
    });
    return
  }

  const isUnderVerification = async (address) => {
    const profile = await orbis.getProfile(orbisClient.did);
    let data = profile.data?.details.profile.data;
    if (!data) {
      return(false)
    }
    return(data[address.toLowerCase()])
  }

  return ({
    orbisClient,
    connectSeed,
    addWallet,
    isUnderVerification
   })
}

export default useOrbis;
