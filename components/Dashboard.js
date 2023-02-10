import DashBoardCard from "./dashBoardCard";
import { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import Web3Modal from 'web3modal'
import axios from 'axios'
import { useRouter } from 'next/router'

import { FaEthereum } from "react-icons/fa";
import {
    MARKET_ADDRESS, NFT_ADDRESS
  } from '../config'
  
  import NFTMarketplace from '../artifacts/contracts/Marketplace.sol/Marketplace.json'
  import NFT_ABI from '../artifacts/contracts/NFT.sol/Dreamverse.json'
function Dashboard({nfts, soldNfts}) {

    const [userAddress,setUserAddress] = useState('');
    const [dreamNfts, setDreamNfts] = useState([]);
    const [earnings, setEarnings] = useState('0');
    const [nftSold, setNftSold] = useState('0');
    const [nftsOwned, setNftsOwned] = useState([]);

    const [NftsCreated, setNftsCreated] = useState(0);

    const [isError,setIsError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('Error');
    const router = useRouter();

    useEffect(() => {
        NFTSload();
    },[])
    const NFTSload = async () => {

      try{
        const web3Modal = new Web3Modal({
            network: "mainnet",
            cacheProvider: true,
        })
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()

        setUserAddress(await signer.getAddress())
        
    
        const marketplaceContract = new ethers.Contract(MARKET_ADDRESS, NFTMarketplace.abi, signer)
        
    
        const dreamverse = new ethers.Contract(NFT_ADDRESS, NFT_ABI.abi, signer);

        //   const items = await marketplaceContract.fetchItemsCreated(); itemsOwnedbyCaller
        const dreamData = await dreamverse.createdItemBy();

        const number = (await dreamverse.totalItemsCreated()).toNumber();
        const earningInWei = (await marketplaceContract.getCreatorEarning()).toString();
        const sold = (await marketplaceContract.getNftSoldByCreator()).toString();
        const earning = ethers.utils.formatEther(earningInWei).toString();


        const dreamItems = await Promise.all(dreamData.map( async (tokenUri) => {
        const meta = await axios.get(tokenUri.replace('.infura.', '.'));
        const item = meta.data;
        return item;
        }))
    
        const data = await dreamverse.itemsOwnedbyCaller();
        const items = await Promise.all(data.map(async token => {
        const meta = await axios.get(token.tokenUri.replace('.infura.', '.'))
        let item = {
            price: 0,
            tokenId: token.tokenId,
            image: meta.data.image,
            name: meta.data.name,
            description: meta.data.description,
            tokenUri: token.tokenUri
        }
        return item
        }))
        setNftsOwned(items);
        setNftsCreated(number);
        setNftSold(sold);
        setEarnings(earning);
        setDreamNfts(dreamItems);
        console.log(dreamItems);
      }
      catch(error) {
        setIsError(true);
        setErrorMessage(`Error: Loading nfts ${error.message}`);
      }
          
    }

    async function listNft(nft) {

        try{

        if((nft.price).toNumber < 0)
        {
            throw new Error('Please provide valid price');
        }
        const web3Modal = new Web3Modal({
            network: "mainnet",
            cacheProvider: true,
        })
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()

        const marketplaceContract = new ethers.Contract(MARKET_ADDRESS, NFTMarketplace.abi, signer);
        
        const dreamverse = new ethers.Contract(NFT_ADDRESS, NFT_ABI.abi, signer);
        const signerAddress = await signer.getAddress();
        const isApproved = await dreamverse.isApprovedForAll(signerAddress, MARKET_ADDRESS);
        if(!isApproved){
            await dreamverse.setApprovalForAll(MARKET_ADDRESS, true);
        }
        const tx = await marketplaceContract.listNftWithCheck(dreamverse.address, "1" , ethers.utils.parseEther("1"),{
            value: ethers.utils.parseEther("0.05")
        })
        await tx.wait();
        router.push('/marketplace');
        }
        catch(error) {
            setIsError(true);
            setErrorMessage(`Error: Loading nfts ${error.message}`);
        }
    }


    return(
        <div className=" flex flex-col justify-center m-3">


            {
            isError && 
            <div className="alert alert-error w-[40vw] bottom-10 shadow-lg fixed animate-bounce ml-20 z-10">
                <div>
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>{errorMessage}</span>
                </div>
                <div className="flex-none">
                <button className="btn btn-sm btn-primary" onClick={() => {setIsError(false)}}>Ok</button>
                </div>
            </div>
            }
            <div>
                <div className="stats shadow bg-base-200">
  
                    <div className="stat">
                        <div className="stat-figure text-primary">
                        <FaEthereum size={'2rem'}/>
                        </div>
                        <div className="stat-title">Capital Earned</div>
                        <div className="stat-value text-primary">{earnings} Ethers</div>
                        <div className="stat-desc">on Dreameverse</div>
                    </div>
                    
                    <div className="stat">
                        <div className="stat-figure text-secondary">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                        </div>
                        <div className="stat-title">NFTs Sold</div>
                        <div className="stat-value ">{nftSold} DMV</div>
                        <div className="stat-desc">on Dreamerverse</div>
                    </div>
                    
                    <div className="stat">
                        <div className="stat-figure text-secondary">
                        <div className="avatar online">
                            <div className="w-16 rounded-full">
                            <img src={`https://avatars.dicebear.com/api/adventurer-neutral/${userAddress}.svg` } />
                            </div>
                        </div>
                        </div>
                        <div className="stat-value">{NftsCreated}</div>
                        <div className="stat-title">NFTs Created</div>
                        <div className="stat-desc text-primary">on Dreamverse</div>
                    </div>
                    
                </div>
            </div>
            <div className="divider"></div>
            <div>
                <div className=" ml-80 font-title text-primary inline-flex text-lg transition-all duration-200 md:text-3xl border-b-2">
                    <span className="uppercase font-bold  ">NFts</span> 
                    <span className="text-base-content font-bold">Created</span>
                    <span className=" font-bold  ">By</span> 
                    <span className="text-base-content font-bold">You</span>
                </div>
                {
                    dreamNfts.length === 0 && 
                    
                        <div>
                            <h1 className="py-10 px-20 text-3xl">No NFT's Created</h1>
                        </div>
                    
                }
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                {
                    dreamNfts.map( (nft, index) => {              
                    return(
                        <DashBoardCard nft={nft} index={index} key={index} />
                    )
                    })
                }
                </div>
            </div>
            <div className="divider">End</div>
            <div>
                <div className="ml-80 font-title text-primary inline-flex text-lg transition-all duration-200 md:text-3xl border-b-2">
                    <span className="uppercase font-bold  ">NFts</span> 
                    <span className="text-base-content font-bold">Owned</span>
                    <span className=" font-bold  ">By</span> 
                    <span className="text-base-content font-bold">You</span>
                </div>
                
                {
                    nftsOwned.length === 0 && 
                    
                        <div>
                            <h1 className="py-10 px-20 text-3xl">No NFT's Owned</h1>
                        </div>
                    
                }
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                
                {
                    nftsOwned.map( (nft, index) => {              
                    return(
                        <DashBoardCard nft={nft} index={index} key={index} controller={listNft}/>
                    )
                    })
                }
                </div>
            </div>
            <div className="divider">End</div>

        </div>
    )
}

export default Dashboard;

