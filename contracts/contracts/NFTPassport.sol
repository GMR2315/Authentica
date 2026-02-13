// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title NFTPassport
 * @notice ERC-721 contract for Authentica product authentication passports.
 * @dev Each token stores a keccak256 hash of the product's metadata.json.
 *      Only the contract owner (backend wallet) can mint passports.
 *
 * Storage layout:
 *   - _nextTokenId : auto-incrementing token counter (starts at 1)
 *   - _metadataHashes : mapping(uint256 => bytes32) — tokenId → metadataHash
 */
contract NFTPassport is ERC721, Ownable {
    /// @dev Next token ID to mint (starts at 1, never reused)
    uint256 private _nextTokenId;

    /// @dev tokenId → keccak256 hash of the product's metadata.json
    mapping(uint256 => bytes32) private _metadataHashes;

    /// @dev Emitted when a new passport is minted
    event PassportMinted(
        uint256 indexed tokenId,
        address indexed to,
        bytes32 metadataHash
    );

    /**
     * @param initialOwner The address that will own this contract (backend wallet).
     */
    constructor(address initialOwner)
        ERC721("Authentica Passport", "AUTHP")
        Ownable(initialOwner)
    {
        _nextTokenId = 1;
    }

    /**
     * @notice Mint a new NFT passport with a metadata hash.
     * @dev Only callable by the contract owner (backend).
     * @param to The address to receive the NFT (can be contract address or backend wallet).
     * @param metadataHash The keccak256 hash of the product's metadata.json.
     * @return tokenId The newly minted token ID.
     */
    function mintPassport(address to, bytes32 metadataHash)
        external
        onlyOwner
        returns (uint256)
    {
        require(to != address(0), "NFTPassport: mint to zero address");
        require(metadataHash != bytes32(0), "NFTPassport: empty metadata hash");

        uint256 tokenId = _nextTokenId;
        _nextTokenId++;

        _safeMint(to, tokenId);
        _metadataHashes[tokenId] = metadataHash;

        emit PassportMinted(tokenId, to, metadataHash);

        return tokenId;
    }

    /**
     * @notice Get the metadata hash stored for a given token ID.
     * @param tokenId The token ID to query.
     * @return The keccak256 hash of the product's metadata.json.
     */
    function getHash(uint256 tokenId) external view returns (bytes32) {
        require(tokenId > 0 && tokenId < _nextTokenId, "NFTPassport: token does not exist");
        return _metadataHashes[tokenId];
    }

    /**
     * @notice Get the current token counter (next token ID to be minted).
     * @return The next token ID.
     */
    function nextTokenId() external view returns (uint256) {
        return _nextTokenId;
    }
}
