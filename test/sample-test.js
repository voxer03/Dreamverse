const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFT MarketPlace", function () {

  let market, dreamverse, owner, addr0, addr1, addr;
  beforeEach("Deploying contracts", async function () {
    [owner, addr0, addr1, ...addr] = await ethers.getSigners();
    const Market = await ethers.getContractFactory("Marketplace");
     market = await Market.deploy();
    await market.deployed();

    const  Dreamverse = await ethers.getContractFactory("Dreamverse");
     dreamverse = await Dreamverse.deploy(market.address);
    await dreamverse.deployed();
  });

  describe('Testing contract', async () => {
    it('Mint NFT to a address', async () => {
      await dreamverse.mint("SomeIPFS URL");
      expect((await dreamverse.createdItemBy()).length).to.be.equal(1);
      expect(await dreamverse.totalItemsCreated()).to.be.equal(1);
      expect(await dreamverse.ownerOf("1")).to.equal(owner.address);
      expect((await dreamverse.itemsOwnedbyCaller()).length).to.be.equal(1);
    })

    it('Mint NFT and burn', async () => {
      await dreamverse.mint("SomeIPFS URL");
      expect(await dreamverse.ownerOf("1")).to.equal(owner.address);
      expect(await dreamverse.burn("1")).to.emit(dreamverse, "Transfer").withArgs(owner.address, ethers.constants.AddressZero, "1");
    })

    it('Mint NFT to a address and then placing it in market', async () => {
      await dreamverse.mint("SomeIPFS URL");
      expect(await dreamverse.ownerOf("1")).to.equal(owner.address);

      expect(await market.createMarketItem(dreamverse.address,"1",ethers.utils.parseEther("1"),{
        value: ethers.utils.parseEther("0.05")
      }))
      .to.emit(market, "MarketItemCreated");

      const output = await market.fetchMarketItems();
      // console.log(output);

    })

    it("Mint nft, List in market, sell to a user", async () => {
      await dreamverse.mint("SomeIPFS URL");
      expect(await dreamverse.ownerOf("1")).to.equal(owner.address);

      expect(await market.createMarketItem(dreamverse.address,"1",ethers.utils.parseEther("1"),{
        value: ethers.utils.parseEther("0.05")
      }))
      .to.emit(market, "MarketItemCreated");

      expect(await market.connect(addr1).createMarketSale(dreamverse.address, "1", {
        value: ethers.utils.parseEther("1")
      }))
      .to.emit(market,"MarketItemSale");
    })

    it("Mint nft, List in market, sell to a user, relisting in market", async () => {
      await dreamverse.mint("SomeIPFS URL");
      expect(await dreamverse.ownerOf("1")).to.equal(owner.address);

      expect(await market.createMarketItem(dreamverse.address,"1",ethers.utils.parseEther("1"),{
        value: ethers.utils.parseEther("0.05")
      }))
      .to.emit(market, "MarketItemCreated");

      // console.log(await market.getItemInfo("1"));

      expect(await market.connect(addr1).createMarketSale(dreamverse.address, "1", {
        value: ethers.utils.parseEther("1")
      }))
      .to.emit(market,"MarketItemSale");

     
      
      await dreamverse.connect(addr1).setApprovalForAll(market.address, true);
      expect(await dreamverse.ownerOf("1")).to.be.equal(addr1.address);
      expect(await market.connect(addr1).listMarketItem("1", ethers.utils.parseEther("1"),{
        value: ethers.utils.parseEther("0.05")
      }))
      .to.emit(market, "MarketItemCreated");
    })

    it('Mint NFT and list using listNftWithCheck', async () => {
      await dreamverse.mint("SomeIPFS URL");
      expect(await dreamverse.ownerOf("1")).to.equal(owner.address);

      expect(await market.listNftWithCheck(dreamverse.address, "1" , ethers.utils.parseEther("1"),{
        value: ethers.utils.parseEther("0.05")
      })).to.emit(market, "MarketItemCreated");

      const listedItems = await market.fetchMarketItems();
      expect(listedItems.length).to.equal(1);
    })


  })

  describe('Negative Testing Contract', async () => {
    it('Mint NFT, Burn it buy other user', async () => {
      await dreamverse.mint("SomeIPFS URL");
      expect(await dreamverse.ownerOf("1")).to.equal(owner.address);
      
      await expect( dreamverse.connect(addr0).burn("1")).to.be.revertedWith("Dreamverse: Not authorized to burn given tokenId");
    })

    it('Listing Item in market without Listing Price', async()=>{
      await dreamverse.mint("SomeIPFS URL");
      expect(await dreamverse.ownerOf("1")).to.equal(owner.address);

      await expect(market.createMarketItem(dreamverse.address,"1",ethers.utils.parseEther("1")))
      .to.be.revertedWith("Marketplace: Please check Listing Price");
    })

    it('Listing Item in market with Price < 0.000001 matic', async()=>{
      await dreamverse.mint("SomeIPFS URL");
      expect(await dreamverse.ownerOf("1")).to.equal(owner.address);

      await expect(market.createMarketItem(dreamverse.address,"1",ethers.utils.parseEther("0.00000099"), {
        value: ethers.utils.parseEther("0.05")
      }))
      .to.be.revertedWith("price must be at least 0.000001 matic");
    })

    it('Listing Item in market and purchasing with less than price', async()=>{
      await dreamverse.mint("SomeIPFS URL");
      expect(await dreamverse.ownerOf("1")).to.equal(owner.address);

      expect(await market.createMarketItem(dreamverse.address,"1",ethers.utils.parseEther("0.001"), {
        value: ethers.utils.parseEther("0.05")
      }))
      .to.emit(market, "MarketItemCreated");

      await expect( market.createMarketSale(dreamverse.address,"1",{
        value: ethers.utils.parseEther("0.0001")
      })).to.be.revertedWith("Marketplace: Asked price not matched");
    })

    it('Listing Item by a non owner', async () => {
      await dreamverse.mint("SomeIPFS URL");
      expect(await dreamverse.ownerOf("1")).to.equal(owner.address);

      await expect( market.connect(addr0).createMarketItem(dreamverse.address,"1",ethers.utils.parseEther("0.001"), {
        value: ethers.utils.parseEther("0.05")
      }))
      .to.be.revertedWith("ERC721: transfer from incorrect owner");
    })
  })

  describe('Using Fetch functions', async () => {
    it('Fetch my NFTs', async()=>{
      await dreamverse.mint("SomeIPFS URL");
      expect(await dreamverse.ownerOf("1")).to.equal(owner.address);

      expect(await market.createMarketItem(dreamverse.address,"1",ethers.utils.parseEther("0.001"), {
        value: ethers.utils.parseEther("0.05")
      }))
      .to.emit(market, "MarketItemCreated");

      await expect( market.connect(addr0).createMarketSale(dreamverse.address,"1",{
        value: ethers.utils.parseEther("0.001")
      })).to.emit(market, "MarketItemSale");

      const addr0NFTs = await market.connect(addr0).fetchMyNFTs();
      expect(addr0NFTs.length).to.equal(1);

      const ownerNFTs = await market.fetchMyNFTs();
      expect(ownerNFTs.length).to.equal(0);
    })

    it('Fetch all NFTs', async()=>{
      await dreamverse.mint("SomeIPFS URL");
      expect(await dreamverse.ownerOf("1")).to.equal(owner.address);
      await dreamverse.mint("SomeIPFS URL");
      expect(await dreamverse.ownerOf("2")).to.equal(owner.address);
      await dreamverse.mint("SomeIPFS URL");
      expect(await dreamverse.ownerOf("3")).to.equal(owner.address);

      expect(await market.createMarketItem(dreamverse.address,"1",ethers.utils.parseEther("0.001"), {
        value: ethers.utils.parseEther("0.05")
      }))
      .to.emit(market, "MarketItemCreated");

      expect(await market.createMarketItem(dreamverse.address,"2",ethers.utils.parseEther("0.001"), {
        value: ethers.utils.parseEther("0.05")
      }))
      .to.emit(market, "MarketItemCreated");

      expect(await market.createMarketItem(dreamverse.address,"3",ethers.utils.parseEther("0.001"), {
        value: ethers.utils.parseEther("0.05")
      }))
      .to.emit(market, "MarketItemCreated");
      
      const listedItems = await market.fetchMarketItems();
      expect(listedItems.length).to.equal(3);
    })
  })

  describe('Testing ERC721 Contract', async () => {
    it('check pausable', async () => {
      await dreamverse.pause();

      await expect(dreamverse.mint("SomeIPFS URL")).to.be.revertedWith('ERC721Pausable: token transfer while paused');
    })

    it('Pausing, Unpausing and minting', async () => {
      await dreamverse.pause();

      await expect(dreamverse.mint("SomeIPFS URL"))
      .to.be.revertedWith('ERC721Pausable: token transfer while paused');

      await dreamverse.unpause();

      expect(await dreamverse.mint("SomeIPFS URL")).to.emit(dreamverse, "Transfer");
    })

    it('pausing with other address than owner and Revert', async () => {
      await expect(dreamverse.connect(addr0).pause()).to.reverted;
    })
  })

});

