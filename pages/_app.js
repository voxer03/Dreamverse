/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
import '../styles/globals.css'
import Link from 'next/link'
import { useState } from 'react';
import { ethers } from 'ethers';
// import Web3Modal, { providers } from 'web3modal';
import { useEffect } from 'react';
import { FaGithub } from "react-icons/fa";
import Web3Modal from 'web3modal';

function MainContent({ Component, pageProps }) {
  const [active,setActive] = useState('active');
  const [userAddress, setuserAddress] = useState('')
  const [isMetamaskInstalled, setisMetamaskInstalled] = useState(true)
  const [isConnected,setIsConnected] = useState(false);
  const [pageTitle, setPageTitle] = useState('Hello, Create a universe of your own');

  let isUsed = false;
  let provider;

  useEffect(() => {
    connectProvider();
    if(!isConnected && !isUsed){
      isUsed = true;
      connectWallet();
    }
  },[]);
  
  async function connectProvider() {
    if(!window.ethereum){
      setisMetamaskInstalled(false);
      return;
    }
       
    const accounts = await window.ethereum.request({method: "eth_requestAccounts"})
    console.log(accounts);
    provider = new ethers.providers.Web3Provider(window.ethereum);

  }
  const connectWallet = async () => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const signature = await signer.signMessage('Connect to this website');
    console.log(signer)
    const address =await signer.getAddress()
    setuserAddress(address);
    setIsConnected(true);
    // console.log(await signer.getAddress());
  }
  return (
    <div className='flex flex-col max-w-[100vw] overflow-hidden' data-theme = 'luxury'>

        <nav className='border-b p-6 flex flex-col w-80 h-screen shadow-xl bg-base-200 fixed '>
          <div className="font-title text-primary inline-flex text-lg transition-all duration-200 md:text-3xl">
            <Link href = "/">
                <a className="btn btn-ghost w-64">
                <span className="uppercase font-bold text-3xl ">dream</span> 
                <span className="text-base-content lowercase font-bold text-3xl">VERSE</span>
                </a>
             </Link>
            
          </div>
          <div className="flex flex-col  mt-4 menu w-72 p-1 rounded-box transition-all">

            <ul className=''>
              <li>
                <Link href = "/marketplace">
                <a className={`mr-2 w-full hover:bg-secondary ${isConnected ? '' : 'hidden'}`} >
                  MarketPlace
                </a>
                </Link>
              </li>
              <li>
                <Link href= "/create-item">
                  <a className={`mr-6 w-full hover:bg-secondary ${isConnected ? '' : 'hidden'}`}>
                  Create & Sell
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/my-assets">
                  <a className={`mr-6 w-full hover:bg-secondary ${isConnected ? '' : 'hidden'}`}>
                    My Digital Assets
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/creator-dashboard">
                  <a className={`mr-6 w-full hover:bg-secondary ${isConnected ? '' : 'hidden'}`}>
                    Creator Dashboard
                  </a>
                </Link>
              </li>
            </ul>
          </div>

          <div className="card mt-10 bg-primary text-primary-content">
              <div className="card-body items-center text-center">
                <div className="avatar">
                  <div className="w-24 mask mask-squircle">
                  <img src={`https://avatars.dicebear.com/api/adventurer-neutral/${userAddress}.svg` }/>
                  </div>
                </div>
                <p className=" font-bold w-56 truncate">{userAddress}</p>
                <p>{ isMetamaskInstalled ? (isConnected ? 'Hello, What a good day to Buy some NFts' :'Connect with Metamask' ) : 'please install Metamask'}</p>
                <div className="card-actions">
                  <button className={`btn btn-wide btn-active ${isMetamaskInstalled  ? '' : 'btn-disabled text-black'}`} onClick={connectWallet}>{isConnected  ? 'Connected' : 'Connect'}</button>
                </div>
              </div>
          </div>

        </nav>
      <div className='flex w-screen '>

        <nav className='border-b p-6 w-80 h-screen flex flex-col w- shadow-xl bg-base-100'>
        <div className="flex flex-col  mt-4 menu w-72 p-1 rounded-box">

          <ul className='hidden'>
            <li>
              <Link href = "/">
              <a className="mr-2 w-full hover:bg-secondary">
                Home
              </a>
              </Link>
            </li>
            </ul>
            </div>
        </nav>
        {/* <div className="divider lg:divider-horizontal bg-accent">OR</div>  */}
        <div className=' w-screen '>
          <div className="navbar justify-between   bg-base-100 static ">
            <div className=' ml-2 text-2xl  '>
              {pageTitle}
            </div>
            <div className="flex-none">
              <a href='https://github.com/voxer03' target={'_blank'} className="btn btn-square btn-ghost" rel="noreferrer">
                <FaGithub size={'1.5rem'}/>
              </a>
            </div>
          </div>
         <Component {...pageProps} />
          
        </div>
      </div>
    </div>
  )
}

export default MainContent;
