// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./interfaces/IERC5192.sol";

/// @title InCoinCredential — Soulbound Academic Credential Token
/// @author INCOIN Platform
/// @notice Non-transferable ERC-721 tokens representing verifiable academic credentials
/// @dev Implements ERC-5192 (Minimal Soulbound NFTs) on top of ERC-721 + AccessControl
contract InCoinCredential is ERC721, ERC721Enumerable, AccessControl, Pausable, IERC5192 {

    // ══════════════════════════════════════════════════════════════════
    //  ROLES
    // ══════════════════════════════════════════════════════════════════

    /// @notice Role granted to authorized credential issuers (universities, institutes, etc.)
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");

    // ══════════════════════════════════════════════════════════════════
    //  TYPES
    // ══════════════════════════════════════════════════════════════════

    /// @notice Supported credential types
    enum CredentialType {
        ACADEMIC_DEGREE,    // 0 — Títulos universitarios / técnicos
        CERTIFICATION,      // 1 — Certificaciones / Cursos
        DIPLOMA,            // 2 — Diplomados
        INTERNSHIP,         // 3 — Pasantías laborales
        VOLUNTEERING        // 4 — Voluntariados
    }

    /// @notice On-chain credential data (minimal — details stored off-chain)
    struct Credential {
        address holder;             // Wallet del estudiante
        address issuer;             // Wallet de la institución emisora
        CredentialType credType;    // Tipo de credencial
        bytes32 metadataHash;       // Keccak256 hash de los datos off-chain
        uint256 issuedAt;           // Timestamp de emisión
        bool revoked;               // Estado de revocación
    }

    // ══════════════════════════════════════════════════════════════════
    //  STATE
    // ══════════════════════════════════════════════════════════════════

    /// @notice Auto-incrementing token ID counter
    uint256 private _nextTokenId;

    /// @notice Mapping from tokenId to credential data
    mapping(uint256 => Credential) private _credentials;

    /// @notice Mapping from student address to their token IDs
    mapping(address => uint256[]) private _studentTokenIds;

    /// @notice Base URI for token metadata (ERC-721 tokenURI)
    string private _baseTokenURI;

    // ══════════════════════════════════════════════════════════════════
    //  EVENTS
    // ══════════════════════════════════════════════════════════════════

    /// @notice Emitted when a new credential is issued
    event CredentialIssued(
        uint256 indexed tokenId,
        address indexed holder,
        address indexed issuer,
        CredentialType credType,
        bytes32 metadataHash
    );

    /// @notice Emitted when a credential is revoked
    event CredentialRevoked(
        uint256 indexed tokenId,
        address indexed issuer,
        string reason
    );

    // ══════════════════════════════════════════════════════════════════
    //  ERRORS
    // ══════════════════════════════════════════════════════════════════

    /// @notice Thrown when attempting to transfer a soulbound token
    error SoulboundTokenNonTransferable();

    /// @notice Thrown when querying a non-existent credential
    error CredentialDoesNotExist(uint256 tokenId);

    /// @notice Thrown when a non-issuer tries to revoke a credential
    error OnlyOriginalIssuerCanRevoke(uint256 tokenId, address caller);

    /// @notice Thrown when trying to revoke an already revoked credential
    error CredentialAlreadyRevoked(uint256 tokenId);

    /// @notice Thrown when minting to the zero address
    error InvalidRecipient();

    /// @notice Thrown when batch arrays length mismatch or empty
    error InvalidBatchParameters();

    // ══════════════════════════════════════════════════════════════════
    //  CONSTRUCTOR
    // ══════════════════════════════════════════════════════════════════

    /// @notice Initializes the INCOIN Credential contract
    /// @param admin Address that receives DEFAULT_ADMIN_ROLE
    constructor(address admin) ERC721("INCOIN Credential", "INCOIN") {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ISSUER_ROLE, admin); // Admin is also an issuer by default
        _nextTokenId = 1; // Start token IDs at 1
        _baseTokenURI = "http://localhost:3000/api/metadata/";
    }

    // ══════════════════════════════════════════════════════════════════
    //  CORE FUNCTIONS
    // ══════════════════════════════════════════════════════════════════

    /// @notice Issues a new credential to a student
    /// @param to The student's wallet address
    /// @param credType The type of credential being issued
    /// @param metadataHash Keccak256 hash of the off-chain metadata
    /// @return tokenId The ID of the newly minted credential token
    function issueCredential(
        address to,
        CredentialType credType,
        bytes32 metadataHash
    ) external onlyRole(ISSUER_ROLE) whenNotPaused returns (uint256) {
        if (to == address(0)) revert InvalidRecipient();

        uint256 tokenId = _nextTokenId++;

        // Store credential data
        _credentials[tokenId] = Credential({
            holder: to,
            issuer: msg.sender,
            credType: credType,
            metadataHash: metadataHash,
            issuedAt: block.timestamp,
            revoked: false
        });

        // Track student's tokens
        _studentTokenIds[to].push(tokenId);

        // Mint the token (this triggers _update which allows minting)
        _safeMint(to, tokenId);

        // Emit soulbound lock event (ERC-5192)
        emit Locked(tokenId);

        // Emit credential event
        emit CredentialIssued(tokenId, to, msg.sender, credType, metadataHash);

        return tokenId;
    }

    /// @notice Issues a batch of credentials in a single transaction
    /// @param recipients Array of student wallet addresses
    /// @param credType The type of credential for the whole batch
    /// @param metadataHashes Array of Keccak256 hashes corresponding to each recipient
    /// @return tokenIds Array of newly minted token IDs
    function issueBatch(
        address[] calldata recipients,
        CredentialType credType,
        bytes32[] calldata metadataHashes
    ) external onlyRole(ISSUER_ROLE) whenNotPaused returns (uint256[] memory) {
        uint256 count = recipients.length;
        if (count == 0 || count != metadataHashes.length) {
            revert InvalidBatchParameters();
        }

        uint256[] memory tokenIds = new uint256[](count);

        for (uint256 i = 0; i < count; i++) {
            address to = recipients[i];
            if (to == address(0)) revert InvalidRecipient();

            uint256 tokenId = _nextTokenId++;
            tokenIds[i] = tokenId;

            _credentials[tokenId] = Credential({
                holder: to,
                issuer: msg.sender,
                credType: credType,
                metadataHash: metadataHashes[i],
                issuedAt: block.timestamp,
                revoked: false
            });

            _studentTokenIds[to].push(tokenId);
            _safeMint(to, tokenId);

            emit Locked(tokenId);
            emit CredentialIssued(tokenId, to, msg.sender, credType, metadataHashes[i]);
        }

        return tokenIds;
    }

    /// @notice Revokes a credential (only the original issuer can revoke)
    /// @param tokenId The ID of the credential to revoke
    /// @param reason Human-readable reason for revocation
    function revokeCredential(
        uint256 tokenId,
        string calldata reason
    ) external whenNotPaused {
        if (!_credentialExists(tokenId)) revert CredentialDoesNotExist(tokenId);

        Credential storage cred = _credentials[tokenId];

        if (cred.issuer != msg.sender) {
            revert OnlyOriginalIssuerCanRevoke(tokenId, msg.sender);
        }
        if (cred.revoked) revert CredentialAlreadyRevoked(tokenId);

        cred.revoked = true;

        emit CredentialRevoked(tokenId, msg.sender, reason);
    }

    // ══════════════════════════════════════════════════════════════════
    //  VIEW FUNCTIONS
    // ══════════════════════════════════════════════════════════════════

    /// @notice Returns the full credential data for a given token
    /// @param tokenId The ID of the credential
    /// @return The Credential struct
    function getCredential(uint256 tokenId) external view returns (Credential memory) {
        if (!_credentialExists(tokenId)) revert CredentialDoesNotExist(tokenId);
        return _credentials[tokenId];
    }

    /// @notice Returns all token IDs belonging to a student
    /// @param student The student's wallet address
    /// @return An array of token IDs
    function getStudentCredentials(address student) external view returns (uint256[] memory) {
        return _studentTokenIds[student];
    }

    /// @notice Checks if a credential is valid (exists and is not revoked)
    /// @param tokenId The ID of the credential
    /// @return True if the credential exists and is not revoked
    function isCredentialValid(uint256 tokenId) external view returns (bool) {
        if (!_credentialExists(tokenId)) return false;
        return !_credentials[tokenId].revoked;
    }

    /// @notice Returns the total number of credentials issued
    /// @return The next token ID minus 1
    function totalCredentialsIssued() external view returns (uint256) {
        return _nextTokenId - 1;
    }

    // ══════════════════════════════════════════════════════════════════
    //  ADMIN FUNCTIONS
    // ══════════════════════════════════════════════════════════════════

    /// @notice Grants ISSUER_ROLE to an institution's address
    /// @param issuer The address to authorize as an issuer
    function addIssuer(address issuer) external onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(ISSUER_ROLE, issuer);
    }

    /// @notice Removes ISSUER_ROLE from an institution's address
    /// @param issuer The address to remove as an issuer
    function removeIssuer(address issuer) external onlyRole(DEFAULT_ADMIN_ROLE) {
        revokeRole(ISSUER_ROLE, issuer);
    }

    /// @notice Sets the base URI for all tokens
    /// @param baseURI_ The new base URI (e.g. "https://incoin.edu.bo/api/metadata/")
    function setBaseURI(string calldata baseURI_) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _baseTokenURI = baseURI_;
    }

    /// @notice Pauses all minting and revocation operations
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    /// @notice Unpauses all operations
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    // ══════════════════════════════════════════════════════════════════
    //  ERC-5192 SOULBOUND IMPLEMENTATION
    // ══════════════════════════════════════════════════════════════════

    /// @notice Returns the locking status of a token (always true for INCOIN)
    /// @param tokenId The ID of the token
    /// @return True — all INCOIN credentials are permanently locked/soulbound
    function locked(uint256 tokenId) external view override returns (bool) {
        if (!_credentialExists(tokenId)) revert CredentialDoesNotExist(tokenId);
        return true; // All credentials are always soulbound
    }

    /// @notice Override _update to block all transfers except minting
    /// @dev This is the core soulbound mechanism. Only mint (from == address(0)) is allowed.
    ///      Any attempt to transfer, transferFrom, or safeTransferFrom will revert.
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override(ERC721, ERC721Enumerable) returns (address) {
        address from = _ownerOf(tokenId);

        // Allow minting (from == address(0))
        // Block ALL other transfers (soulbound enforcement)
        if (from != address(0) && to != address(0)) {
            revert SoulboundTokenNonTransferable();
        }

        return super._update(to, tokenId, auth);
    }

    // ══════════════════════════════════════════════════════════════════
    //  REQUIRED OVERRIDES
    // ══════════════════════════════════════════════════════════════════

    /// @dev Required override for ERC721Enumerable
    function _increaseBalance(
        address account,
        uint128 value
    ) internal override(ERC721, ERC721Enumerable) {
        super._increaseBalance(account, value);
    }

    /// @dev Base URI for computing {tokenURI}.
    function _baseURI() internal view override returns (string memory) {
        return bytes(_baseTokenURI).length > 0 ? _baseTokenURI : "http://localhost:3000/api/metadata/";
    }

    /// @dev Required override to declare supported interfaces
    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, ERC721Enumerable, AccessControl) returns (bool) {
        // ERC-5192 interface ID: 0xb45a3c0e
        return interfaceId == 0xb45a3c0e || super.supportsInterface(interfaceId);
    }

    // ══════════════════════════════════════════════════════════════════
    //  INTERNAL HELPERS
    // ══════════════════════════════════════════════════════════════════

    /// @dev Checks if a credential/token exists
    function _credentialExists(uint256 tokenId) internal view returns (bool) {
        return tokenId > 0 && tokenId < _nextTokenId;
    }
}
