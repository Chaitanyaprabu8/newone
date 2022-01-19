// SPDX-License-Identifier: MIT OR Apache-2.0
pragma solidity ^0.8.3;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import "hardhat/console.sol";

contract NFTMarket is ReentrancyGuard {
  using Counters for Counters.Counter;
  Counters.Counter private _itemIds;
  Counters.Counter private _itemsSold;
  Counters.Counter private _projectIds;

  address payable owner;
  uint256 listingPrice = 0.025 ether;

  constructor() {
    owner = payable(msg.sender);
  }
  function getCurrentProjectId() public returns (uint256) {
    _projectIds.increment();
    uint256 currentProjectId = _projectIds.current();
    return currentProjectId;
  }
  struct MarketItem {
    uint itemId;
    address nftContract;
    uint256 tokenId;
    uint256 projectId;
    address payable seller;
    address payable owner;
    uint256 price;
    bool sold;
    bool depSign;
    bool contSign;
  }
  struct ProvisionItem {
    uint itemId;
    address nftContract;
    uint256 tokenId;
    uint256 projectId;
    address payable seller;
    address payable owner;
    uint256 price;
    bool sold;
    bool depSign;
  }

  mapping(uint256 => MarketItem) private idToMarketItem;
  mapping(uint256 => ProvisionItem) private idToProvisionItem;

  event MarketItemCreated (
    uint indexed itemId,
    address indexed nftContract,
    uint256 indexed tokenId,
    uint256 projectId,
    address seller,
    address owner,
    uint256 price,
    bool sold,
    bool depSign,
    bool contSign
  );
  event ProvisionItemCreated (
    uint indexed itemId,
    address indexed nftContract,
    uint256 indexed tokenId,
    uint256 projectId,
    address seller,
    address owner,
    uint256 price,
    bool sold,
    bool depSign
  );
  
  /* Returns the listing price of the contract */
  function getListingPrice() public view returns (uint256) {
    return listingPrice;
  }
  
  /* Places an item for sale on the marketplace */
  function createMarketItem(
    address nftContract,
    uint256 tokenId,
    uint256 price
  ) public payable nonReentrant {
    require(price > 0, "Price must be at least 1 wei");
    
    _itemIds.increment();
    _projectIds.increment();
    uint256 itemId = _itemIds.current();
  
    idToMarketItem[itemId] =  MarketItem(
      itemId,
      nftContract,
      tokenId,
      projectId,
      payable(msg.sender),
      payable(address(0)),
      price,
      false,
      false,
      false
    );

    IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);

    emit MarketItemCreated(
      itemId,
      nftContract,
      tokenId,
      projectId,
      msg.sender,
      address(0),
      price,
      false,
      false,
      false
    );
  }
  /* Places an item for sale on the marketplace */
  function createProvisionItem(
    address nftContract,
    uint256 tokenId,
    uint256 projectId,
    uint256 price
  ) public payable nonReentrant {
    require(price > 0, "Price must be at least 1 wei");

    _itemIds.increment();
    uint256 itemId = _itemIds.current();
  
    idToProvisionItem[itemId] =  ProvisionItem(
      itemId,
      nftContract,
      tokenId,
      projectId,
      payable(msg.sender),
      payable(address(0)),
      price,
      false,
      false
    );

    IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);

    emit ProvisionItemCreated(
      itemId,
      nftContract,
      tokenId,
      projectId,
      msg.sender,
      address(0),
      price,
      false,
      false
    );
  }

  /* Creates the sale of a marketplace item */
  /* Transfers ownership of the item, as well as funds between parties */
  function createMarketSale(
    address nftContract,
    uint256 itemId
    ) public payable nonReentrant {
    uint price = idToMarketItem[itemId].price;
    uint tokenId = idToMarketItem[itemId].tokenId;

    idToMarketItem[itemId].seller.transfer(msg.value);
    IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);
    idToMarketItem[itemId].owner = payable(msg.sender);
    idToMarketItem[itemId].sold = true;
    _itemsSold.increment();
  }
  /* sign the project for department */
  function projectdepSign(
    address nftContract,
    uint256 itemId
    ) public payable nonReentrant {
    uint price = idToMarketItem[itemId].price;
    uint tokenId = idToMarketItem[itemId].tokenId;
    idToMarketItem[itemId].depSign = true;
  }
  /* sign the project for contractor */
  function projectcontSign(
    address nftContract,
    uint256 itemId
    ) public payable nonReentrant {
    uint price = idToMarketItem[itemId].price;
    uint tokenId = idToMarketItem[itemId].tokenId;
    idToMarketItem[itemId].contSign = true;
  }
  /* sign the provision for department */
  function provisionDeptSign(
    address nftContract,
    uint256 itemId
    ) public payable nonReentrant {
    uint price = idToProvisionItem[itemId].price;
    uint tokenId = idToProvisionItem[itemId].tokenId;
    idToProvisionItem[itemId].depSign = true;
  }

  /* Returns all unsold market items */
  function fetchMarketItems() public view returns (MarketItem[] memory) {
    uint itemCount = _itemIds.current();
    uint unsoldItemCount = _itemIds.current() - _itemsSold.current();
    uint currentIndex = 0;

    MarketItem[] memory items = new MarketItem[](unsoldItemCount);
    for (uint i = 0; i < itemCount; i++) {
      if (idToMarketItem[i + 1].owner == address(0)) {
        uint currentId = i + 1;
        MarketItem storage currentItem = idToMarketItem[currentId];
        items[currentIndex] = currentItem;
        currentIndex += 1;
      }
    }
    return items;
  }
  /* Returns all provisions of a project */
  function fetchProvisions(uint256 projectId) public view returns (ProvisionItem[] memory) {
    uint itemCount = _itemIds.current();
    uint unsoldItemCount = _itemIds.current() - _itemsSold.current();
    uint currentIndex = 0;

    ProvisionItem[] memory items = new ProvisionItem[](unsoldItemCount);
    for (uint i = 0; i < itemCount; i++) {
      if (idToProvisionItem[i + 1].projectId == projectId) {
        uint currentId = i + 1;
        ProvisionItem storage currentItem = idToProvisionItem[currentId];
        items[currentIndex] = currentItem;
        currentIndex += 1;
      }
    }
    return items;
  }
  /* Returns onlyl items that a user has purchased */
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

  /* Returns only items a user has created */
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
}