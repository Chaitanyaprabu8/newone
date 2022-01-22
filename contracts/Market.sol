// SPDX-License-Identifier: MIT OR Apache-2.0
pragma solidity ^0.8.3;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import "hardhat/console.sol";

contract NFTMarket is ReentrancyGuard {
  using Counters for Counters.Counter;
  Counters.Counter private _provisionIds;
  Counters.Counter private _projectIds;

  address payable owner;
  uint256 listingPrice = 0.00000000000025 ether;

  constructor() {
    owner = payable(msg.sender);
  }
  
  struct MarketItem {
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
    uint provisionId;
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
    address indexed nftContract,
    uint256 indexed tokenId,
    uint256 indexed projectId,
    address seller,
    address owner,
    uint256 price,
    bool sold,
    bool depSign,
    bool contSign
  );
  event ProvisionItemCreated (
    uint indexed provisionId,
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
    
    _projectIds.increment();
    uint256 projectId = _projectIds.current();
  
    idToMarketItem[projectId] =  MarketItem(
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

    _provisionIds.increment();
    uint256 provisionId = _provisionIds.current();
  
    idToProvisionItem[provisionId] =  ProvisionItem(
      provisionId,
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
      provisionId,
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
    uint256 projectId
    ) public payable nonReentrant {
    uint price = idToMarketItem[projectId].price;
    uint tokenId = idToMarketItem[projectId].tokenId;

    idToMarketItem[projectId].seller.transfer(msg.value);
    IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);
    idToMarketItem[projectId].owner = payable(msg.sender);
    idToMarketItem[projectId].sold = true;
  }
  /* sign the project for department */
  function projectdepSign(
    address nftContract,
    uint256 projectId
    ) public payable nonReentrant {
    idToMarketItem[projectId].depSign = true;
  }
  /* sign the project for contractor */
  function projectcontSign(
    address nftContract,
    uint256 projectId
    ) public payable nonReentrant {
    idToMarketItem[projectId].contSign = true;
  }
  /* sign the provision for department */
  function provisionDeptSign(
    address nftContract,
    uint256 provisionId
    ) public payable nonReentrant {
    idToProvisionItem[provisionId].depSign = true;
  }

  /* Returns all project items */
  function fetchMarketItems() public view returns (MarketItem[] memory) {
    uint itemCount = _projectIds.current();
    uint unsoldItemCount = _projectIds.current();
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
  function fetchProvisions() public view returns (ProvisionItem[] memory) {
    uint itemCount = _provisionIds.current();
    uint projectItemCount = 0;
    uint currentIndex = 0;
    
    ProvisionItem[] memory items = new ProvisionItem[](itemCount);
    for (uint i = 0; i < itemCount; i++) {
    
        uint currentId = i + 1;
        ProvisionItem storage currentItem = idToProvisionItem[currentId];
        items[currentIndex] = currentItem;
        currentIndex += 1;
      
    }
    
    return items;
  }
  /* Returns onlyl items that a user has purchased */
  function fetchProvisionsbyProject(uint256 projectId) public view returns (ProvisionItem[] memory) {
    uint totalItemCount = _provisionIds.current();
    uint itemCount = 0;
    uint currentIndex = 0;

    for (uint i = 0; i < totalItemCount; i++) {
      if (idToProvisionItem[i + 1].projectId == projectId) {
        itemCount += 1;
      }
    }

    ProvisionItem[] memory items = new ProvisionItem[](itemCount);
    for (uint i = 0; i < totalItemCount; i++) {
      if (idToProvisionItem[i + 1].projectId == projectId) {
        uint currentId = i + 1;
        ProvisionItem storage currentItem = idToProvisionItem[currentId];
        items[currentIndex] = currentItem;
        currentIndex += 1;
      }
    }
    return items;
  }

  /* Returns only items a user has created */
  function fetchItemsCreated() public view returns (MarketItem[] memory) {
    uint totalItemCount = _projectIds.current();
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