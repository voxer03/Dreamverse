import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from 'web3modal'
import { useRouter } from 'next/router'

import Dashboard from '../components/Dashboard'

import {
  MARKET_ADDRESS, NFT_ADDRESS
} from '../config'

import NFTMarketplace from '../artifacts/contracts/Marketplace.sol/Marketplace.json'
import NFT_ABI from '../artifacts/contracts/NFT.sol/Dreamverse.json';

export default function CreatorDashboard() {
    const [nfts, setNfts] = useState([]);
    const [soldNfts, setSoldNfts] = useState([]);

    const [loadingState, setLoadingState] = useState('not-loaded');

    useEffect(() => {
        loadNFTs()
      }, [])
      async function loadNFTs() {
        const web3Modal = new Web3Modal({
          network: "mainnet",
          cacheProvider: true,
        })
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()
    
        const marketplaceContract = new ethers.Contract(MARKET_ADDRESS, NFTMarketplace.abi, signer)
        const data = await marketplaceContract.fetchMyNFTs()
    
        const dreamverse = new ethers.Contract(NFT_ADDRESS, NFT_ABI.abi, signer);
    
        const items = await Promise.all(data.map(async i => {
          const tokenURI = await dreamverse.tokenURI(i.tokenId)
          const meta = await axios.get(tokenURI.replace('.infura.', '.'))
          let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
          let item = {
            price,
            tokenId: i.tokenId.toNumber(),
            seller: i.seller,
            owner: i.owner,
            sold: i.sold,
            image: meta.data.image,
            tokenURI
          }
          return item
        }))

        
        console.log(items);
        const soldItems = items.filter(i => i.sold);
        setSoldNfts(soldItems);
        setNfts(items)
        setLoadingState('loaded') 
      }

      return(
          <Dashboard nfts={nfts} soldNfts={soldNfts} />
      )
}