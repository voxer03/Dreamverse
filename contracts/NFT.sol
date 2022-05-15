//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Pausable.sol";

contract Dreamverse is 
Ownable,
ERC721,
ERC721URIStorage,
ERC721Pausable {

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    address _marketAddress;

    mapping(address => uint256[]) createdItems;
    struct tokenIdWithUri {
        uint256 tokenId;
        string tokenUri;
    }

    constructor(address marketAddress) ERC721("Dreamverse", "DMV") {
        _marketAddress = marketAddress;
    }

    function mint(string memory _tokenUri) public returns(uint) {

        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();

        createdItems[_msgSender()].push(newItemId);
        _mint(msg.sender, newItemId);
        _setTokenURI(newItemId, _tokenUri);
        setApprovalForAll(_marketAddress, true);
        return newItemId;
    }

    function totalItemsCreated() public view returns(uint256) {
        return createdItems[msg.sender].length;
    }

    function createdItemBy() view public returns(string[] memory) {
        uint256[] memory tokenIDs = createdItems[msg.sender];
        
        string[] memory tokenURIs = new string[](tokenIDs.length);
        for(uint32 i =0 ; i < tokenIDs.length ;i++) {
            tokenURIs[i] = tokenURI(tokenIDs[i]);
        }
        return tokenURIs;
    }

    function itemsOwnedbyCaller() view public returns(tokenIdWithUri[] memory){
        uint256 tokenID = _tokenIds.current() ;
        uint256 counter = 0;

        tokenIdWithUri[] memory tempTokenURIs = new tokenIdWithUri[](tokenID);
        for(uint256 i =0 ; i < tokenID ;i++) {
            if(ownerOf(i+1) == msg.sender){
                tempTokenURIs[counter].tokenUri = tokenURI((i+1));
                tempTokenURIs[counter].tokenId = i+1;
                counter++;
            }
        }

        tokenIdWithUri[] memory tokenURIs = new tokenIdWithUri[](counter);
        for(uint256 i =0 ; i < counter; i++){
            tokenURIs[i] = tempTokenURIs[i];
        }
        return tokenURIs;

    }

    function burn(uint256 tokenId) public returns(uint256){
        
        require(ownerOf(tokenId) == msg.sender, "Dreamverse: Not authorized to burn given tokenId");
        _burn(tokenId);
        return tokenId;
    }
    function _burn(uint256 tokenId) internal virtual override(ERC721URIStorage,ERC721) {
        super._burn(tokenId);
    }
    function tokenURI(uint256 tokenId) public view virtual override(ERC721URIStorage,ERC721)  returns (string memory){
        return super.tokenURI(tokenId);
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override(ERC721Pausable, ERC721) {
        super._beforeTokenTransfer(from, to, tokenId);
    }
    
}

