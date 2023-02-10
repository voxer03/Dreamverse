import { useState } from "react";

function NftCard(props) {
  const {nft,index,page, buttonController} = props;
  const [price, setPrice] = useState('');
  let style = '';
  let buttonText = '';
  if(page == 'sell') {
    style = "border  h-[70vh] shadow rounded-xl overflow-hidden";
    buttonText = 'Buy';
  }
  else {
    style = "border  h-[57vh] shadow rounded-xl overflow-hidden";
    buttonText = 'List';
  }
  return(
    <div key={index} className={style}>
      <div className="min-h-[50%] max-h-[50%] max-w-none flex justify-center overflow-hidden">
        <img src={nft.image.replace('.infura.', '.')} alt={nft.name} className="object-contain"/>
      
      </div>
      
    
    <div className="pl-4 pt-4">
      <p className="text-2xl h-[64px] font-semibold">
        {nft.name}
      </p>
      <div className="h-[70px] overflow-hidden">
        <p className="text-gray-400 truncate"> {nft.description} </p>
      </div>
    </div>
    <div className="p-4 lg:mt-[-2em] sm:mt[-1em] md:[-3em] bg-accent">
      {page == 'sell' && 
      
       <div>
          <p className="text-2xl mb-4 font-bold text-white">{nft.price} Matic</p>
          <button  onClick={() => { buttonController(nft)}} className="btn-primary w-full border-solid font-bold py-2 px-12 rounded">
            { buttonText}
          </button>
       </div>
      
      }
      {
        page !== 'sell' &&
        <div>
             <label htmlFor="my-modal" className="btn btn-primary w-full border-solid font-bold text-xl py-2 px-12 rounded">List</label>


            <input type="checkbox" id="my-modal" className="modal-toggle" />
            <div className="modal">
              <div className="modal-box">
                <h3 className="font-bold text-lg">Please click on List button</h3>
                <p className="py-4"> 1. Will ask for Approval if not already approved <br/> 2. Will Ask to list NFT</p>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Enter amount to List</span>
                  </label>
                  <label className="input-group">
                    <span>Price</span>
                    <input type="text" placeholder="Enter amount" className="input input-bordered" onChange={e => {setPrice(e.target.value);  }}/>
                    <span>Ether</span>
                  </label>
                </div>
                <div className="modal-action">
                <button  onClick={() => { buttonController({...nft, price : price})}} className="btn-primary w-full border-solid font-bold py-2 px-12 rounded">
                  { buttonText}
                </button>
                <label htmlFor="my-modal" className="btn">Cancel</label>
                </div>
              </div>
            </div>
        </div>
       
      }
      
    </div>
  </div> 
  )
}

export default NftCard;

/*

*/