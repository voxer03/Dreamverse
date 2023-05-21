/* eslint-disable @next/next/no-img-element */
import {useState} from 'react';
import {ethers} from 'ethers';
import {Web3Storage} from 'web3.storage';
import {useRouter} from 'next/router';
import Web3Modal from 'web3modal';
import {
  NFT_ADDRESS, MARKET_ADDRESS, DATA
} from '../config';
const web3Client = new Web3Storage({token: DATA})



import NFT_ABI from '../artifacts/contracts/NFT.sol/Dreamverse.json';
import MARKET_ABI from '../artifacts/contracts/Marketplace.sol/Marketplace.json';

export default function CreateItem () {


    const [fileUrl, setFileurl] = useState(null);
    const [fileName,setFileName] = useState('Select File');
    const [formInput, updateFormInput] = useState({price: '', name : '', description: ''});
    const [minted, setMinted] = useState(false);
    const [sell, setSell] = useState(false);
    const [isFormComplete, setIsFormComplete] = useState(false);

    const [isCreating, setIsCreating] = useState(false);
    const [messageInfo, setMessageInfo] = useState('Creating your nft');
 
    const [isError,setIsError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('Error');
    const router = useRouter()

    const checkFormComplete = () => {
      if(formInput.price.length >= 0 && formInput.description.length >= 0 && formInput.name.length >= 0)
        setIsFormComplete(true);
      else 
        setIsFormComplete(false);
    }

    // console.log(props.provider);
    async function onChange(e) {
        setFileName(e.target.files[0].name);
        const file = e.target.files[0];
        try{
            // const added = await client.add(file,{
            //     progress: (prog) => console.log(`received: ${prog}`) 
            // });
            const added = await web3Client.put([file]);
            console.log('We are here', added);
            await web3Client.status(added)
            const res = await web3Client.get(added)
            const files = await res.files()
            // console.log(files);
            for (const file of files) {
              const url = `https://ipfs.io/ipfs/${file.cid}`;
              setFileurl(url);
            }
        } catch (error){
            console.log(error);
        }
    }

    async function uploadToIPFS() {
        const { name, description, price} = formInput;

        if(!name || !description || !price || !fileUrl) return;
        const obj = {
          name,
          description,
          image: fileUrl
        }
        const metadata = new Blob([JSON.stringify(obj)], { type: 'application/json' })
        try{
          console.log('data')
            const added = await web3Client.put([new File([metadata], 'metadata.json')]);
            await web3Client.status(added)
          console.log('data1')

            const res = await web3Client.get(added)
            const files = await res.files()

            console.log(files);
            let metadataUrl;
            for (const file of files) {
              metadataUrl = `https://ipfs.io/ipfs/${file.cid}`;
            }
            return metadataUrl;
        } catch(error) {
            console.log('Error: Uploading file: ',error);
            setIsError(true);
            setErrorMessage(`Error: Uploading file ${error.message}`);
            // return error.message;
        }

    }

    async function listNFTForSale() {

      try{  
        // if(!isFormComplete) return;
        setIsCreating(true);
        setMessageInfo('Uploading On IPFS');
        const metadataUrl = await uploadToIPFS();
        
        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();

        
        const dreamverse = new ethers.Contract(NFT_ADDRESS, NFT_ABI.abi,signer);
        setMessageInfo('Confirm Transaction on Metamask to Mint');
        let transaction = await dreamverse.mint(metadataUrl);
        setMessageInfo('Wait for Transaction');
        let tx = await transaction.wait();
        setMinted(true);

        let event = tx.events[0];
        let value = event.args[2];
        let tokenId = value.toNumber();
        console.log(tokenId);

        const price = ethers.utils.parseUnits(formInput.price, 'ether');

        const market = new ethers.Contract(MARKET_ADDRESS,MARKET_ABI.abi,signer);
        setMessageInfo('Confirm Transaction on Metamask to List');
        let listingPrice = await market.getlistingPrice();
        listingPrice = listingPrice.toString();

        transaction = await market.createMarketItem( 
            NFT_ADDRESS, tokenId, price, {
                value: listingPrice
            });
        setSell(true);
        setMessageInfo('Wait for Transaction');
        await transaction.wait();
        router.push('/marketplace');
        setIsCreating(true);
      }
      catch(error) {
        setIsError(true);
        setErrorMessage(`Error: Listing NFT ${error.message}`);
      }

    }

    return (

      <div className=' flex flex-col justify-center'>

        {
          isCreating && 
          <div className="alert alert-info w-[40vw] bottom-10 shadow-lg fixed animate-bounce ml-20 z-10">
            <div>
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>{messageInfo}</span>
            </div>
            <div className="flex-none">
              <button className="btn btn-sm btn-primary btn" onClick={() => {setIsError(false)}}>Ok</button>
            </div>
          </div>
        }
        {
          isError && 
          <div className="alert alert-error w-[40vw] bottom-10 shadow-lg fixed animate-bounce ml-20 z-10">
            <div>
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>{errorMessage}</span>
            </div>
            <div className="flex-none">
              <button className="btn btn-sm btn-primary btn" onClick={() => {setIsError(false)}}>Ok</button>
            </div>
          </div>
        }
        <ul className="steps mt-5">
                <li className={`step ${ isFormComplete ? 'step-primary' :''}`}>Details</li>
                <li className={`step ${ fileUrl ? 'step-primary' :''}`}>Create</li>
                <li className={`step ${ minted ? 'step-primary' :''}`}>List</li>
                <li className={`step`}>All Done</li>
              </ul>
      
      <div className="flex justify-center mt-10 ">
        
        <div className="w-1/2 flex flex-col pb-12 from-control mr-5">

        <label className="label ">
          <span className="label-text">Enter Name</span>
        </label>
        <label className="input-group input-group-vertical ">
          <span className='pt-2 pb-2'>Name</span>
          <input 
            placeholder="Asset Name"
            className=" input input-bordered"
            onChange={e => {updateFormInput({ ...formInput, name: e.target.value }); checkFormComplete(); }}
          />
          {/* <input type="text" placeholder="info@site.com" className="input input-bordered" /> */}
        </label>
          
        <label className="label ">
          <span className="label-text">Enter Description</span>
        </label>
        <label className="input-group input-group-vertical">
          <span className='pt-2 pb-2'>Description</span>
          <textarea
            placeholder="Asset Description"
            className="input input-bordered pt-2"
            onChange={e => {updateFormInput({ ...formInput, description: e.target.value }); checkFormComplete();}}
          />
          {/* <input type="text" placeholder="info@site.com" className="input input-bordered" /> */}
        </label>
          

          
            <label className="label">
              <span className="label-text">Enter amount</span>
            </label>
            <label className="input-group">
              <span>Price</span>
              <input
                placeholder="Asset Price in Matic"
                className="input-bordered pr-20 input"
                onChange={e => {updateFormInput({ ...formInput, price: e.target.value }); checkFormComplete();}}
              />
              <span>Matic</span>
            </label>

          
          <button onClick={listNFTForSale} className={`btn mt-6 btn-warning font-bold ${fileUrl ? '' : 'btn-disabled'}`}>
            Create NFT
          </button>
        </div>

        <div className="card w-80 bg-base-100 bordered h-[60vh]">
        
        <div className="flex">
              <label className=" bg-base-300 w-[100%]  flex items-center py-2 tracking-wide rounded-tr-lg  rounded-tl-lg cursor-pointer hover:bg-base-200">
                  <svg className=" ml-10 w-8 h-8" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M16.88 9.1A4 4 0 0 1 16 17H5a5 5 0 0 1-1-9.9V7a3 3 0 0 1 4.52-2.59A4.98 4.98 0 0 1 17 8c0 .38-.04.74-.12 1.1zM11 11h3l-4-4-4 4h3v3h2v-3z" />
                  </svg>
                  <span className=" text-base leading-normal ml-5 truncate font-extrabold">{fileName}</span>
                  <input
                      type="file"
                      name="Asset"
                      className="hidden"
                      onChange={onChange}
                />
              </label>
          </div>
          <div className="min-h-[80%] max-h-[80%] max-w-none flex justify-center overflow-hidden">
          {
            fileUrl && (
              <img className="object-contain" width="350" src={fileUrl} alt="upload" />
            )
          }
          </div>

          
        </div>
      </div>
      </div>
      )

}