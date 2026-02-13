const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFTPassport", function () {
  let nftPassport;
  let owner;
  let addr1;
  let addr2;

  // A sample metadata hash (keccak256 of some metadata.json content)
  const sampleHash = ethers.keccak256(ethers.toUtf8Bytes('{"name":"Premium Watch","serial_number":"SN-001"}'));
  const sampleHash2 = ethers.keccak256(ethers.toUtf8Bytes('{"name":"Designer Bag","serial_number":"SN-002"}'));

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const NFTPassport = await ethers.getContractFactory("NFTPassport");
    nftPassport = await NFTPassport.deploy(owner.address);
    await nftPassport.waitForDeployment();
  });

  describe("Deployment", function () {
    it("should set the correct name and symbol", async function () {
      expect(await nftPassport.name()).to.equal("Authentica Passport");
      expect(await nftPassport.symbol()).to.equal("AUTHP");
    });

    it("should set the correct owner", async function () {
      expect(await nftPassport.owner()).to.equal(owner.address);
    });

    it("should start with nextTokenId = 1", async function () {
      expect(await nftPassport.nextTokenId()).to.equal(1n);
    });
  });

  describe("mintPassport", function () {
    it("should mint a passport and return tokenId 1", async function () {
      const tx = await nftPassport.mintPassport(addr1.address, sampleHash);
      const receipt = await tx.wait();

      // Token 1 should be owned by addr1
      expect(await nftPassport.ownerOf(1)).to.equal(addr1.address);

      // nextTokenId should now be 2
      expect(await nftPassport.nextTokenId()).to.equal(2n);
    });

    it("should store the correct metadata hash", async function () {
      await nftPassport.mintPassport(addr1.address, sampleHash);
      const storedHash = await nftPassport.getHash(1);
      expect(storedHash).to.equal(sampleHash);
    });

    it("should emit PassportMinted event", async function () {
      await expect(nftPassport.mintPassport(addr1.address, sampleHash))
        .to.emit(nftPassport, "PassportMinted")
        .withArgs(1n, addr1.address, sampleHash);
    });

    it("should mint multiple passports with incrementing IDs", async function () {
      await nftPassport.mintPassport(addr1.address, sampleHash);
      await nftPassport.mintPassport(addr2.address, sampleHash2);

      expect(await nftPassport.ownerOf(1)).to.equal(addr1.address);
      expect(await nftPassport.ownerOf(2)).to.equal(addr2.address);
      expect(await nftPassport.getHash(1)).to.equal(sampleHash);
      expect(await nftPassport.getHash(2)).to.equal(sampleHash2);
      expect(await nftPassport.nextTokenId()).to.equal(3n);
    });

    it("should revert if called by non-owner", async function () {
      await expect(
        nftPassport.connect(addr1).mintPassport(addr1.address, sampleHash)
      ).to.be.revertedWithCustomError(nftPassport, "OwnableUnauthorizedAccount");
    });

    it("should revert if minting to zero address", async function () {
      await expect(
        nftPassport.mintPassport(ethers.ZeroAddress, sampleHash)
      ).to.be.revertedWith("NFTPassport: mint to zero address");
    });

    it("should revert if metadata hash is empty (bytes32(0))", async function () {
      await expect(
        nftPassport.mintPassport(addr1.address, ethers.ZeroHash)
      ).to.be.revertedWith("NFTPassport: empty metadata hash");
    });
  });

  describe("getHash", function () {
    it("should return the correct hash for a minted token", async function () {
      await nftPassport.mintPassport(addr1.address, sampleHash);
      expect(await nftPassport.getHash(1)).to.equal(sampleHash);
    });

    it("should revert for a non-existent token (id = 0)", async function () {
      await expect(nftPassport.getHash(0)).to.be.revertedWith(
        "NFTPassport: token does not exist"
      );
    });

    it("should revert for a token that has not been minted yet", async function () {
      await expect(nftPassport.getHash(999)).to.be.revertedWith(
        "NFTPassport: token does not exist"
      );
    });
  });

  describe("ERC-721 compliance", function () {
    it("should support ERC-721 interface", async function () {
      // ERC-721 interface ID: 0x80ac58cd
      expect(await nftPassport.supportsInterface("0x80ac58cd")).to.be.true;
    });

    it("should allow transfer of passport", async function () {
      await nftPassport.mintPassport(addr1.address, sampleHash);

      // addr1 transfers token 1 to addr2
      await nftPassport.connect(addr1).transferFrom(addr1.address, addr2.address, 1);
      expect(await nftPassport.ownerOf(1)).to.equal(addr2.address);

      // Hash remains unchanged after transfer
      expect(await nftPassport.getHash(1)).to.equal(sampleHash);
    });

    it("should track balances correctly", async function () {
      await nftPassport.mintPassport(addr1.address, sampleHash);
      await nftPassport.mintPassport(addr1.address, sampleHash2);

      expect(await nftPassport.balanceOf(addr1.address)).to.equal(2n);
      expect(await nftPassport.balanceOf(addr2.address)).to.equal(0n);
    });
  });
});
