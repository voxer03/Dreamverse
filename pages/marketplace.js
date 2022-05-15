import { ethers } from "ethers";
import { useEffect, useState } from "react";
import axios from "axios";
import Web3Modal from 'web3modal';
import NftCard from '../components/card'

import {NFT_ADDRESS, MARKET_ADDRESS} from '../config';

import NFT_ABI from '../artifacts/contracts/NFT.sol/Dreamverse.json';
import MARKET_ABI from '../artifacts/contracts/Marketplace.sol/Marketplace.json';
export default function Home() {

  const [nfts, setNfts] = useState([]);
  const [loadingState,setLoadingState] = useState(false);

  useEffect( () => {
    loadNFTs();
  },[])
  async function loadNFTs() {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const dreamverseContract = new ethers.Contract(NFT_ADDRESS,NFT_ABI.abi, provider);
    const marketContract = new ethers.Contract(MARKET_ADDRESS, MARKET_ABI.abi, provider)

    const data = await marketContract.fetchMarketItems();

    const items = await Promise.all(data.map(async i => {
      const tokenUri = await dreamverseContract.tokenURI(i.tokenId);
      const meta = await axios.get(tokenUri);
      let price = ethers.utils.formatUnits(i.price.toString(), 'ether');

      let item = {
        price,
        itemId: i.itemId.toNumber(),
        tokenId : i.tokenId.toNumber(),
        seller: i.seller,
        owner: i.owner,
        image: meta.data.image,
        name: meta.data.name,
        description: meta.data.description,
      }
      return item;
    }))
    console.log(items);
    setNfts(items);
    setLoadingState(true);
  }

  async function buyNFT(nft) {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);

    const signer = provider.getSigner();
    const marketplace = new ethers.Contract(MARKET_ADDRESS, MARKET_ABI.abi, signer);

    const price = ethers.utils.parseUnits(nft.price.toString(), 'ether');

    const transaction = await marketplace.createMarketSale(NFT_ADDRESS,nft.itemId, {
      value: price
    })
    await transaction.wait();
    loadNFTs();

  }

  if(loadingState && nfts.length == 0) {
    return(
      <h1 className="px-20 py-10 text-3xl">
        No Items in Marketplace
      </h1>
    )
  }
  return (
    <div className="flex justify-center">
      <div className="px-4" 
        style = {{
          maxWidth:  '1600px',
        }}
      >

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {
            nfts.map( (nft, index) => {              
              return(
                <NftCard nft={nft} index={index} key={index} page={'sell'} buttonController={buyNFT}/>
              )
            })
          }
        </div>
      </div>
    </div>
  )
  
}

