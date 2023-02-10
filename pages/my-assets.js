import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from 'web3modal'
import { useRouter } from 'next/router'

import NftCard from '../components/card'

import {
  MARKET_ADDRESS, NFT_ADDRESS
} from '../config'

import NFTMarketplace from '../artifacts/contracts/Marketplace.sol/Marketplace.json'
import NFT_ABI from '../artifacts/contracts/NFT.sol/Dreamverse.json';
export default function MyAssets() {
  const [nfts, setNfts] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')
  const router = useRouter()
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
      const meta = await axios.get(tokenURI.replace('.infura.','.'))
      let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
      let item = {
        itemId: i.itemId.toNumber(),
        price,
        tokenId: i.tokenId.toNumber(),
        seller: i.seller,
        owner: i.owner,
        image: meta.data.image,
        tokenURI
      }
      return item
    }))

    console.log(items)
    setNfts(items)
    setLoadingState('loaded') 
  }

  

  async function listNFT(nft) {

    const web3Modal = new Web3Modal({
      network: "mainnet",
      cacheProvider: true,
    })
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    const market = new ethers.Contract(MARKET_ADDRESS, NFTMarketplace.abi, signer)
    
    const dreamverse = new ethers.Contract(NFT_ADDRESS, NFT_ABI.abi, signer);
    const signerAddress = await signer.getAddress();

    const isApproved = await dreamverse.isApprovedForAll(signerAddress, MARKET_ADDRESS);

    if(!isApproved){
      await dreamverse.setApprovalForAll(MARKET_ADDRESS, true);
    }
    

    let listingPrice = await market.getlistingPrice();
        listingPrice = listingPrice.toString();

    const price = ethers.utils.parseUnits(nft.price, 'ether');
    await market.listMarketItem(nft.itemId, price , {
      value: listingPrice 
    });

    router.push('/marketplace');
    
  }


  if (loadingState === 'loaded' && !nfts.length) return (<h1 className="py-10 px-20 text-3xl">No NFTs owned</h1>)
  return (
    <div className="flex justify-center">
      <div className="p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {
            nfts.map( (nft, index) => {              
              return(
                <NftCard nft={nft} index={index} key={index} buttonController= {listNFT}/>
              )
            })
          }
        </div>
      </div>
    </div>
  )
}