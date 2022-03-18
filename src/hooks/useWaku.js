import { useEffect,useState } from "react";
import { Waku } from 'js-waku';

function useWaku() {
  const [waku,setWaku] = useState();



  useEffect(async () => {
    const newWaku = await Waku.create({ bootstrap: { default: true } });
    await newWaku.waitForRemotePeer();
    setWaku(newWaku);
  }, []);
  return({waku})
}

export default useWaku;
