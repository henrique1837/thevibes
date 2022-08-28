import React from 'react'
import {
  Box,
  Paragraph,
  Text,
  Anchor,
  Select,
  Image,
 } from 'grommet';

export default function Spaces(props){
  const spaces = [
    {
      name: "TheVibes",
      image : "https://ipfs.io/ipfs/QmeVRmVLPqUNZUKERq14uXPYbyRoUN7UE8Sha2Q4rT6oyF",
      description: "Default Space of TheVibes Space. Originaly done at The HashAvatars",
      path: "/",
      uri: "https://dweb.link/ipns/thehashavatars.crypto",
      tilesetURI: "https://szadiart.itch.io/craftland-demo"
    },
    {
      name: "CryptoBadRobots",
      image : "https://cryptobadrobots-crypto.ipns.dweb.link/config/images/badrobots.jpeg",
      description: "We are Crypto Bad Bots, the new civilization of the world! 🌎🤖",
      path: "/badrobots-v0",
      uri: "https://cryptobadrobots-crypto.ipns.dweb.link/",
      tilesetURI: "https://sketchfab.com/3d-models/ruined-city-c82b395bb6b44427a1f379f54e106845"
    },
    {
      name: "TheVibes3D",
      image : "https://ipfs.io/ipfs/bafkreiaui7kqyj22m7m6lbt22l3w3kfkhxxfz33f5vgpryalegp35q7k7m",
      description: "TheVibes Space done with enable3d",
      path: "/thespace3d-v0",
      uri: "https://dweb.link/ipns/snowflakeshash.crypto",
      tilesetURI: "https://sketchfab.com/3d-models/low-poly-scene-forest-waterfall-536a2db7384145c9aff9bfdfe2aeb5ab"
    },
    {
      name: "ColorNGhosts",
      image : "data:image/svg+xml;base64,PHN2ZyBpZD0nYScgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJyB2aWV3Qm94PScwIDAgODIuNjYzNjQgNjkuMTg3MTUnPjxkZWZzPjxsaW5lYXJHcmFkaWVudCBpZD0nZycgeDE9JzAnIHgyPScxJyB5MT0nMCcgeTI9JzEnIHNwcmVhZE1ldGhvZD0ncGFkJz48c3RvcCBvZmZzZXQ9JzAlJyBzdG9wLWNvbG9yPSdyZ2IoMjMsMTM3LDIxMCknLz4gPHN0b3Agb2Zmc2V0PSc1MCUnIHN0b3AtY29sb3I9J3JnYigyMTAsMjMsMTIxKScvPiA8c3RvcCBvZmZzZXQ9JzEwMCUnIHN0b3AtY29sb3I9J3JnYigxMzcsMTIxLDIzKScvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxwYXRoIGZpbGw9J3VybCgjZyknIGQ9J003Ny44MTA2NiwyMC41NzI1MmMtNC43MzEwMi03LjMxNDc2LTEwLjQ3ODUyLTcuMjIzMTQtMTQuNzYzNTUtNi42ODQwMi01LjY4NjIyLC43MTUzOS0xMC41NjMxMSw0LjU4NTQ1LTEyLjY0MDAxLDkuOTI2OTQsMCwwLTEuNjk5MjgsNC41NTE3LTEuNjk5MjgsMTIuNjcyMThsLS4wMDA0OSwuMDAwNjFjLjA4ODY4LC44MDg2NS0uMzU1MzUsOC45NzQ3OS0uMzU1MzUsOC45NzQ3OS0uMjA2MTgsMy41NzIxNC0uOTQxMjIsNy4wNzU2Mi0yLjg5MzI1LDEwLjEyNDQ1LS40NDExNiwuNjg5MTUtMi44MDA5NiwzLjY1OTM2LTIuODAwOTYsMy42NTkzNi0xLjk1MDc0LDIuNDAxNDMtMS40NDUxOSwyLjQwMTI1LTEuNDQ1MTksMi40MDEyNSwxLjcwNTMyLDMuMzkxMDUsNS4zMDA0Miw1LjAzMjk2LDguOTQ1NjIsMy44NTc0MiwwLDAsMS4xMDg0Ni0uMzk3NzcsMi4wNDYxNC0uNDUwNjgsMi4xMzUxOS0uMTIwNDIsNC4wNDIyNCwuMzI0ODksNS43ODQ4NSwxLjkyNTIzLDIuODgyODcsMi42NDczNCw2LjA4NjM2LDIuNzM5MjYsOS40NDQ1MiwxLjE5NjQ3LDEuNjk3MzMtLjc3OTg1LDMuNDAwNjMtMS4zMjQ4Myw1LjE1NTMzLTEuMjg2NSwuMzQ0NDIsLjAwNzUxLC42OTExNiwuMDQwNDcsMS4wNDAwNCwuMDk2OTIsLjUwNjk2LC4wODIwOSwxLjAxNzQsLjIwMTY2LDEuNTM1NjQsLjQwMTk4LDEuMTk2MTcsLjQ2MjM0LDIuMzI2NjYsMS4wOTQ0MiwzLjczMjU0LDEuNzY2OTEsMCwwLDMuMjkxNzUtMTIuNjYzNywzLjcxMTI0LTIyLjI1NzQ1LC4wNTQwMi0xLjczMjYsLjA1OTUxLTMuNDY2OCwuMDUyOTItNS4yMDQ5LS4wNTI5Mi0xMy45NTQxNi00Ljg1MDc3LTIxLjEyMDk3LTQuODUwNzctMjEuMTIwOTdaTTQyLjY2OTkxLDU5LjI0OTE1IE0zNy4zNjM4Miw0MS43NDYyMmMtMS4xNTUxNS0xLjc4MTY4LTIuMDY2ODMtMy42NTA1MS0yLjY2NjA4LTUuNjMwNjgtMS4zNjEyNy00LjQ5ODQxLTEuMzkxNzItMTMuNDQzNzMtMS4zOTE3Mi0xMy40NDM3My0uMDQzMTUtMy4wNDAxNi0uMjEzNTYtNi4wODU1Ny0uNjU0NzItOS4wNzQ5NS0uMDk0OTEtLjY0Mjc2LS4yMzEyLTEuMjY1MjYtLjM4NzUxLTEuODc2NzdsLS4wMDI4MS0uMDExMTFjLS44MDM4OS0zLjEzNjYtMi40MTIxNy01LjgyNjY2LTQuNjk4NjEtNy44MzQ5NmwtLjAwMDQzLS4wMDAzMWMtLjY2Mzk0LS41ODMxMy0xLjM3NzItMS4xMTY3Ni0yLjE1NDMtMS41NzcyN2wtLjAzMjY1LS4wMTg2OGMtMS42Mzk1My0uOTY1ODgtMy41MTU0NC0xLjY1NDE3LTUuNjE3NDMtMS45ODgyOEMxNS44NTIxNi0uMzMxMjksMTIuMTI3NjctLjA2MjQzLDguNzMwNzYsMi4xNzI2OGMtMi44NzI4LDEuODkwMi00LjY2NjUsNC41NjcwMi01LjkxMzIxLDcuNjA3MTgtLjIxMjI4LC41MTc1OC0uNDEzNTEsMS4wNDI0OC0uNTk2MzcsMS41NzkyMi0uMzU0OTgsMS4wNDE5OS0uNjQ4NDQsMi4wOTMzOC0uOTEwNTgsMy4xNDkzNWwtLjAxMDE5LC4wNDA0MUMtLjQwNTIyLDIxLjg2Nzc0LC4wNTU0MSwyNy45NDI2MywuMDU5OTksMjguMDc1MDJjMCwwLC4wMjQ5LDQuNjIzNDcsLjY0NTM5LDguODc1NzMsLjA0MzI3LC4yOTY2OSwuMDg1NTcsLjU5MzY5LC4xMjcxNCwuODkwNjksMS4yMDY1NCwxMC4wNTg5NiwzLjQyODY1LDE1LjkzMDczLDMuNDI4NjUsMTUuOTMwNzMsLjMyNzg4LS4xNzMwMywuNDYyMjItLjIyODM5LC41Nzk3Ny0uMzA4MjksMy4wNjQzMy0yLjA4Mzg2LDYuMjM1OTYtMi41OTM4MSw5LjY5ODYxLS45MjE2OWwyLjU2NzU3LC45MjM0YzIuNjQxMTcsLjYyMDA2LDUuMTY1NDEsLjA4NDU5LDcuNTM5NDktMi4xMzMzLDEuODY4OS0xLjc0NTk3LDQuMTcxMDgtMi4yMjU4OSw2Ljc1MjAxLTEuNjA2NzUsMCwwLDcuMzk2NDIsMS4xMTQzMiw5LjMwODIzLTMuNzkzOTUsMCwwLTEuNjc0MDctMS41Mjc4OS0zLjM0MzAyLTQuMTg1MzZaJy8+PGc+PHBhdGggZmlsbD0ncmdiKDMwLDMwLDMwKScgZD0nTTUzLjk1MzUsMjguOTgyODNjLS42OTg0NCwuMDYyODMtMS4xNDY4NSwuNTk0NDEtMS4xMzU2MywxLjM0Nzc2LC4wMDUxNSwuMzQwMzgsLjA1MjEzLC42ODAxNiwuMDgwMTEsMS4wMjAxNmwuMDA0NTEtLjAwMDI5Yy4wMzAzNCwuMzY4MzIsLjAzMTgsLjc0MTg4LC4wOTcwOCwxLjEwMzk0LC4xMjkxOSwuNzE2OTUsLjU4NzE5LDEuMTAyOTYsMS4zMTM0OCwxLjA3MzgzLC43MzIyLS4wMjk0MSwxLjE5NTYyLS40Nzg2OCwxLjIxNjE4LTEuMTg0NiwuMDIzMDUtLjc5MDQzLS4wNDMyOC0xLjU5NzcxLS4xOTIwMS0yLjM3NDQ1LS4xMzIyOS0uNjkwNjMtLjY0NjU2LTEuMDUyNzEtMS4zODM3Mi0uOTg2MzRaIE02OS4wNTYzOSwzMC4wMDYzN2MtLjU1MjktLjQ3NzcxLTEuMjgzNC0uMzk1MS0xLjg5NTE4LC4yMTQzNS0xLjE0MDc0LDEuMTM2MzEtMi4yMzkzNiwxLjIyMzktMy41NjU3MywuMjg0MzItLjcwMzUxLS40OTg0Ny0xLjQzNjg3LS40NTI4OS0xLjkwMjA1LC4xMTgxNy0uNDg1MDksLjU5NTM4LS4zOTY5NCwxLjI5MTM1LC4yNjQ5OCwxLjg3NzIsLjU5NDMxLC41MjYxMSwxLjI1NDIzLC44NjAwOSwxLjk2MTM2LDEuMDQ2NzQsLjE4NDcxLC4wNDg3OSwuMzcyNDgsLjA4OCwuNTYzNjMsLjExNjUxLC4zNzkwNSwuMDU2NDIsLjc2ODczLC4wNzkwMywxLjE2OTk1LC4wNjI3MiwxLjM2Mzk5LS4xNzAyMywyLjUyODAxLS43MDE0NiwzLjQxNTY2LTEuNzU2MzMsLjMxMzk2LS4zNzMxOSwuNDU1NjEtLjc1MTU1LC40MzcyMy0xLjEwMjQ5LS4wMDY5MS0uMTMxMzYtLjAzNzQ4LS4yNTgzNS0uMDkwMzMtLjM3OTk4LS4wNzUyNi0uMTczNDMtLjE5MTkxLS4zMzY0NC0uMzU5NTQtLjQ4MTIyWiBNNzcuODY1MDEsMjkuMzQ0M2MtLjAzMDI3LS4zNjgzMi0uMDM2MjctLjc0MDY4LS4wOTYxMS0xLjEwNDIyLS4xMTc3Mi0uNzE1NjEtLjU1NDIzLTEuMTA1MTItMS4yODcxOS0xLjEwNzA3LS4xMjc5MS0uMDAwMy0uMjQ4ODUsLjAyMjE2LS4zNjUxNCwuMDU0NzEtLjIwMjM1LC4wNTY2OS0uMzg1MzUsLjE1NTA5LS41MzAzOCwuMjk1MjQtLjIyNjY0LC4yMTkwMy0uMzY2MjQsLjUyNzE5LS4zNjQ0OCwuODg1ODQsLjAwMzcyLC43NjUxMSwuMDU0OTEsMS41NDAyMiwuMTkyMywyLjI5MTUsLjEyNzE1LC42OTUyOCwuNjMwMDksMS4wNjc3NSwxLjM2MTMyLDEuMDI3MjUsLjY5NjA2LS4wMzg2MiwxLjE3MTA1LS41ODEwMywxLjE2ODk5LTEuMzIzMTgtLjAwMDk5LS4zNDAxMS0uMDUxMzktLjY4MDA2LS4wNzkzMS0xLjAyMDA3WiBNNy43NjUwMiwxMS43NDE5Yy0xLjczOTg5LS4wNDc2Ny0zLjMwODg5LDEuNDAzNTctMy4zMjI4NiwzLjA3MzQyLS4wMDY5NywuODM4NTQsLjY4MTMxLDEuMzkyNCwxLjQzODY0LDEuMTQ2ODUsLjUwMDU1LS4xNjIzNSwuNjYzMzQtLjU2MDMxLC43NjY0OC0xLjA0NTUyLC4xNzM3NC0uODE3NjcsLjg2NTUzLTEuMTc0NjksMS41MDk0OC0uODI2MTksLjQxMDQ4LC4yMjIxNCwuNDg4NjksLjYxNDE0LC41NTc3NCwxLjAzNjMzLC4xMTgzOCwuNzI0MzIsLjYxMjQ2LDEuMDk2MywxLjI1Nzc5LDEuMDA0MTIsLjU4NDU2LS4wODM1MSwuOTYyMS0uNTk3MzUsLjkzMzc5LTEuMjcxMTItLjA3MTAzLTEuNjg5NTYtMS40NjM2Ni0zLjA3MTk2LTMuMTQxMDUtMy4xMTc4OFogTTE4LjU2NTU4LDE3LjEzNjAxYy0xLjA4NzEyLC44NDg0NC0xLjgyOTAxLC44MTczNi0yLjg4MzY5LS4xMjA5Mi0uMjI2MDMtLjIwMTA5LS40NTc0LS4zMDI0Mi0uNjg0NzItLjM0NTU4LS42MzY4My0uMTE3NC0xLjAwMjYyLC40MTI2My0xLjAwMjYyLC40MTI2My0uMzM1ODUsLjQzNDM0LS4zMDU4NywxLjAxMTMxLC4xNDM3NiwxLjUwMjg3LC43NTAzMiwuODIwMTUsMS42ODIxNywxLjI3Njg0LDIuNzk5OTEsMS4zMzM1NiwxLjE5OTIyLC4wNzIyOSwyLjIzNTk4LS4zMTE1MiwzLjA5NzI1LTEuMTQyMDEsLjUxNDc2LS40OTYzOSwuNTU3MTktMS4xNTM0OCwuMTQxMTEtMS42MTUxMS0uNDMzNzUtLjQ4MTEtMS4wMTU0My0uNDkwMzEtMS42MTEwMS0uMDI1NDNaIE0yOS45NTMyNCwxNS40NDM5Yy0uMTAyNjEtMS42NDE1MS0xLjUxMDkxLTIuOTkzMi0zLjE1NTE5LTMuMDI4MzMtMS41ODI3Mi0uMDMzODItMi45Mjk2MSwxLjA3MDEyLTMuMjQ5MzUsMi42NjMyMy0uMTYyNTEsLjgwOTYzLC4xMzkwNCwxLjQxMTc1LC43ODA0OSwxLjU1ODczLC42NzI3MiwuMTU0MTMsMS4xODA3Mi0uMjA3MTcsMS4zNjc3My0xLjAzODI5LC4xMzU4My0uNjAzODksLjQ0NTg4LS45NzEyOCwxLjA4NDA1LS45Mzg3LC42NDc1NSwuMDMzMDksLjg5NDc5LC40NzIxNiwuOTg2NjEsMS4wNTkxLC4xMjY4MywuODExNTgsLjU1MTgsMS4xODI2MiwxLjIyNTM3LDEuMTA3MDksLjY0OTc4LS4wNzI4NCwxLjAwOTc0LS41OTEyOCwuOTYwMjktMS4zODI4M1onLz48L2c+PC9zdmc+",
      description: "BUUU",
      path: "/colorghosts-v0",
      uri: "https://bafybeifjjnfg5gzqsyxc7hdmuv3xkd4dkgvfpmovof5jn2id5gtgbx4xqi.ipfs.infura-ipfs.io",
      tilesetURI: "https://sketchfab.com/3d-models/coastal-city-and-the-forest-around-tree-of-life-1ab542ed5cb44e479eb3ea828c501b10"
    },
    {
      name: "ChainSpace",
      image : "https://ipfs.io/ipfs/bafkreiaui7kqyj22m7m6lbt22l3w3kfkhxxfz33f5vgpryalegp35q7k7m",
      description: <Text>Onchain demo using <Anchor href="https://docs.chain.link/docs/chainlink-vrf/" target="_blank" rel="noreferrer">ChainLink VRF</Anchor>, mumbai testnetwork</Text>,
      path: "/chainspace-v0",
      uri: "https://mumbai.polygonscan.com/address/0x2F170CEa20ca9b59F4FE6f8F000Fb8D589C06387",
      tilesetURI: "https://sketchfab.com/3d-models/low-poly-city-41697300a4c643d089784b8688b2ed2c#download"
    }
  ]

  return(
    <>
    <Select
        options={[
          "TheVibes",
          "CryptoBadRobots",
          "TheVibes3D",
          "ColorNGhosts",
          "ChainSpace"
        ]}
        value={props.value}
        onChange={({ option }) => {
          props.setValue(option)
        }}
      />
    <Box alignContent="center" align="center" pad="medium" direction="row-responsive">
      {
        spaces.map(item => {
          if(item.name !== props.value){
            return;
          }
          return(
            <>
            <Image pad="medium" alignSelf="center" src={item.image} width="150px"/>
            <Box pad="medium">
              <Paragraph>{item.description}</Paragraph>
              <Box alignSelf="center" direction="row" gap="xlarge">
              {
                item.uri &&
                <Anchor href={item.uri} target="_blank" size="small" label={
                  item.name !== "ChainSpace" ?
                  "Visit Dapp" :
                  "Contract"
                } />
              }
              {
                item.tilesetURI &&
                <Anchor href={item.tilesetURI} target="blank" size="small" label="Tileset" />
              }
              </Box>

            </Box>
            </>
          )
        })
      }
    </Box>
    </>
  )
}
