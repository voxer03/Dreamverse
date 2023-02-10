import { useState } from "react";

function DashBoardCard(props) {
  const {nft,index, controller} = props;
  const [price, setPrice] = useState('');
  return(
    <div key={index} className='border h-96 shadow rounded-xl overflow-hidden'>
      <div className="min-h-[50%] max-h-[50%] max-w-none flex justify-center overflow-hidden">
        <img src={nft.image.replace('.infura.', '.')} alt={nft.name} className="object-contain"/>
      </div>
      
    <div className="mt-10 bg-accent p-5">
        

        {
          !controller && 

          <div className={`bg-white rounded p-7`}>
            <div className="pl-1 pt-4">
              <p className="text-2xl font-semibold truncate">
                  {nft.name}
              </p>
              <div className=" overflow-hidden pt-4">
                  <p className="text-gray-400 truncate"> {nft.description} </p>
              </div>
            </div>
          </div>
        }
        {
          controller &&
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
                      <input type="text" placeholder="Enter amount" className="input input-bordered" onChange={e => {setPrice(e.target.value);}}/>
                    <span>Ether</span>
                  </label>
                </div>
                <div className="modal-action">
                <button  onClick={() => {controller({...nft, price : price})}} className="btn-primary w-full border-solid font-bold py-2 px-12 rounded">
                  List
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

export default DashBoardCard;

/*

*/