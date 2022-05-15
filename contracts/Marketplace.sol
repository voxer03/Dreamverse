// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

contract Marketplace is 
Ownable,
ReentrancyGuard,
IERC721Receiver
{
    using Counters for Counters.Counter;
    Counters.Counter private _itemIds;
    Counters.Counter private _itemsSold;

    uint256 LISTING_PRICE = 0.05 ether; //O.05 Matic
    mapping(address => uint256) creatorEarned;
    mapping(address => uint256) nftSoldByCreators;

    // mapping(contract => mapping(tokenid => marketItemId))
    mapping(address => mapping(uint256 => uint256)) contractsTokenidToItemid;

    address payable OWNER;
    constructor() {
      OWNER = payable(msg.sender);
    }

    struct MarketItem {
        uint itemId;
        address nftContract;
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        bool sold;
    }

    mapping(uint256 => MarketItem) private idToMarketItem;

    event MarketItemCreated (
        uint indexed itemID,
        address indexed contractAddress,
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint256 price,
        bool sold
    );

    event MarketItemSale (
      uint indexed itemID,
        address indexed contractAddress,
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint256 price,
        bool sold
    );

    function getlistingPrice() public view returns (uint256) {
        return LISTING_PRICE;
    }


    function getItemInfo(uint256 _itemId) view public returns(MarketItem memory) {
      return idToMarketItem[_itemId];
    } 

    /*
     @define This function list the item on the Marketplace 
     @param contractAddress contract Address to which NFT belongs
     @param tokenId tokenId of the NFT
     @param price price NFT's Price
    */
    function createMarketItem (
        address contractAddress,
        uint256 tokenId,
        uint256 price
    ) public payable nonReentrant {

        require(msg.value >= LISTING_PRICE, "Marketplace: Please check Listing Price");
        require(price >= 0.000001 ether, "price must be at least 0.000001 matic" );

        _itemIds.increment();
        uint256 itemId = _itemIds.current();

        idToMarketItem[itemId] = MarketItem(
            itemId,
            contractAddress,
            tokenId,
            payable(msg.sender),
            payable(address(0)),
            price,
            false
        );

        IERC721(contractAddress).safeTransferFrom(msg.sender, address(this), tokenId);

        contractsTokenidToItemid[contractAddress][tokenId] = itemId;
        emit MarketItemCreated(
            itemId,
            contractAddress,
            tokenId,
            payable(msg.sender),
            payable(address(0)),
            price,
            false
        );
    }

    function listMarketItem (
        uint256 _itemID,
        uint256 price
    ) public payable nonReentrant {

        MarketItem storage item = idToMarketItem[_itemID];

        require( item.itemId != 0, "MarketPlace: ItemID not present");
        require(msg.sender == item.owner, "Marketplace : requester is not Owner");
        require(msg.value >= LISTING_PRICE, "Marketplace: Please check Listing Price");
        require(price >= 0.000001 ether, "price must be at least 0.000001 matic" );

        

        item.seller = payable(msg.sender);
        item.owner = payable(address(this));
        item.sold = false;
        item.price = price;

        IERC721(item.nftContract).safeTransferFrom(msg.sender, address(this), item.tokenId);

        _itemsSold.decrement();
        emit MarketItemCreated(
            item.itemId,
            item.nftContract,
            item.tokenId,
            payable(msg.sender),
            payable(address(this)),
            price,
            false
        );
    }


    function listNftWithCheck(
        address contractAddress,
        uint256 tokenId,
        uint256 price
    ) public payable {
      //
      uint256 itemId = contractsTokenidToItemid[contractAddress][tokenId];
      if( itemId != 0 ) {
        listMarketItem(itemId,price);
      }
      else{
        createMarketItem(contractAddress, tokenId, price);
      }
    }

    /*
     @define This function list the item on the Marketplace 
     @param contract Address to which NFT belongs
     @param itemId Item Id of for marketplace
    */

    function createMarketSale (
        address contractAddress,
        uint256 itemId
    ) public payable nonReentrant {

        uint price = idToMarketItem[itemId].price;
        uint tokenId = idToMarketItem[itemId].tokenId;

        require(msg.value >= price , " Marketplace: Asked price not matched");

        address temp_owner = idToMarketItem[itemId].seller;
        creatorEarned[ temp_owner ] += price;

        nftSoldByCreators[temp_owner] += 1;
        idToMarketItem[itemId].seller.transfer(msg.value);

        IERC721(contractAddress).safeTransferFrom(address(this),msg.sender,tokenId);
        idToMarketItem[itemId].owner = payable(msg.sender);
        idToMarketItem[itemId].sold = true;
        _itemsSold.increment();
        payable(owner()).transfer(LISTING_PRICE);

        emit MarketItemSale(
            itemId,
            contractAddress,
            tokenId,
            payable(msg.sender),
            payable(address(0)),
            price,
            true
        );
    }

    function getNftSoldByCreator() public view returns(uint256) {
      return nftSoldByCreators[_msgSender()];
    }

    function getCreatorEarning() public view returns(uint256) {
      return creatorEarned[_msgSender()];
    }
    function fetchMarketItems() public view returns(MarketItem[] memory) {
        uint itemCount =_itemIds.current();
        uint unsoldItemCount = itemCount - _itemsSold.current();

        uint currentIndex = 0;

        MarketItem[] memory items = new MarketItem[](unsoldItemCount);
        for(uint i = 0; i < itemCount; i++) {
            if(idToMarketItem[i+1].owner == address(0) || idToMarketItem[i+1].owner == address(this)) {
                MarketItem storage currentItem = idToMarketItem[i+1];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }

    /* Returns only items that a user has purchased */
    function fetchMyNFTs() public view returns (MarketItem[] memory) {
      uint totalItemCount = _itemIds.current();
      uint itemCount = 0;
      uint currentIndex = 0;

      for (uint i = 0; i < totalItemCount; i++) {
        if (idToMarketItem[i + 1].owner == msg.sender) {
          itemCount += 1;
        }
      }

      MarketItem[] memory items = new MarketItem[](itemCount);
      for (uint i = 0; i < totalItemCount; i++) {
        if (idToMarketItem[i + 1].owner == msg.sender) {
          uint currentId = i + 1;
          MarketItem storage currentItem = idToMarketItem[currentId];
          items[currentIndex] = currentItem;
          currentIndex += 1;
        }
      }
      return items;
    }

    /* Returns only items a user has listed */
    function fetchItemsCreated() public view returns (MarketItem[] memory) {
      uint totalItemCount = _itemIds.current();
      uint itemCount = 0;
      uint currentIndex = 0;

      for (uint i = 0; i < totalItemCount; i++) {
        if (idToMarketItem[i + 1].seller == msg.sender) {
          itemCount += 1;
        }
      }

      MarketItem[] memory items = new MarketItem[](itemCount);
      for (uint i = 0; i < totalItemCount; i++) {
        if (idToMarketItem[i + 1].seller == msg.sender) {
          uint currentId = i + 1;
          MarketItem storage currentItem = idToMarketItem[currentId];
          items[currentIndex] = currentItem;
          currentIndex += 1;
        }
      }
      return items;
    }
    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external override(IERC721Receiver)returns (bytes4){
        return this.onERC721Received.selector;
    }
}