import { FaGithub } from "react-icons/fa";
export default function LandingPage() {

    return (
        <div className="hero min-h-[88vh] ml-5 w-[73vw] bg-accent rounded-lg">
        <div className="hero-content flex-col lg:flex-row-reverse">
          <div className="h-96 max-w-[20vw] flex justify-center overflow-hidden rounded-2xl">
            <img src="etherlogo.gif" />
          </div>
          <div>
            <div className=" flex text-5xl font-bold ">Welcome to 
             <div className=" ml-1 p-2 border-2 rounded-2xl animate-bounce">
                <span className="uppercase font-bold text-5xl text-white pb-2"> dream</span> 
                <span className="text-base-content lowercase font-bold text-5xl pr-2 pb-2">VERSE</span>
             </div>
            </div>
            <div className="flex flex-col">
            <div className="badge badge-warning gap-2 p-5 my-4 font-bold animate-pulse  ">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Join Us for Creating Your Own Universe          
            </div>

            <div className="badge badge-info gap-2 p-5 mb-4 font-bold animate-pulse">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Create your own Nfts and list them in Dreamverse            
            </div>

            <div className="badge badge-error gap-2 p-5 mb-4 font-bold animate-pulse">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Sell, Buy and List Nfts in DreamVerse         
            </div>
            </div>
            <a className="btn btn-primary"href='https://github.com/voxer03/Dreamverse' target={'_blank'} rel="noreferrer" > 
                <FaGithub size={'1.5rem'}/>
                <span className="ml-2">
                    Click Here for Source Code
                </span>
            </a>
          </div>
        </div>
      </div>
    )
}