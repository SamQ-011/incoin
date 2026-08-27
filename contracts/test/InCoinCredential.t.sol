// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "../contracts/InCoinCredential.sol";

contract InCoinCredentialTest {
    InCoinCredential public incoin;
    address public admin = address(this);
    address public issuer = address(0x1111111111111111111111111111111111111111);
    address public student = address(0x2222222222222222222222222222222222222222);
    address public student2 = address(0x3333333333333333333333333333333333333333);
    address public outsider = address(0x4444444444444444444444444444444444444444);

    bytes32 public sampleHash = keccak256(abi.encodePacked("Licenciatura en Informatica - 240h"));

    function setUp() public {
        incoin = new InCoinCredential(admin);
        incoin.addIssuer(issuer);
    }

    function test_Initialization() public view {
        require(
            keccak256(bytes(incoin.name())) == keccak256(bytes("INCOIN Credential")),
            "Incorrect name"
        );
        require(
            keccak256(bytes(incoin.symbol())) == keccak256(bytes("INCOIN")),
            "Incorrect symbol"
        );
        require(
            incoin.hasRole(incoin.DEFAULT_ADMIN_ROLE(), admin),
            "Admin role missing"
        );
        require(
            incoin.hasRole(incoin.ISSUER_ROLE(), admin),
            "Admin should be issuer"
        );
        require(
            incoin.hasRole(incoin.ISSUER_ROLE(), issuer),
            "Issuer role missing"
        );
    }

    function test_IssueCredential() public {
        uint256 tokenId = incoin.issueCredential(
            student,
            InCoinCredential.CredentialType.ACADEMIC_DEGREE,
            sampleHash
        );

        require(tokenId == 1, "First token ID should be 1");
        require(incoin.ownerOf(1) == student, "Student should own token 1");
        require(incoin.balanceOf(student) == 1, "Student balance should be 1");

        InCoinCredential.Credential memory cred = incoin.getCredential(1);
        require(cred.holder == student, "Holder mismatch");
        require(cred.issuer == admin, "Issuer mismatch");
        require(
            cred.credType == InCoinCredential.CredentialType.ACADEMIC_DEGREE,
            "Type mismatch"
        );
        require(cred.metadataHash == sampleHash, "Hash mismatch");
        require(!cred.revoked, "Should not be revoked");
        require(incoin.isCredentialValid(1), "Credential should be valid");
    }

    function test_ERC5192_SoulboundLock() public {
        uint256 tokenId = incoin.issueCredential(
            student,
            InCoinCredential.CredentialType.CERTIFICATION,
            sampleHash
        );

        require(incoin.locked(tokenId), "Token must be locked (ERC-5192)");
        require(
            incoin.supportsInterface(0xb45a3c0e),
            "Must support ERC-5192 interface"
        );
    }

    function test_Soulbound_BlocksTransfers() public {
        uint256 tokenId = incoin.issueCredential(
            student,
            InCoinCredential.CredentialType.ACADEMIC_DEGREE,
            sampleHash
        );

        // Attempting to transfer must revert
        (bool success, ) = address(incoin).call(
            abi.encodeWithSignature("transferFrom(address,address,uint256)", student, student2, tokenId)
        );
        require(!success, "Transfer must fail because credential is soulbound");
    }

    function test_StudentCredentialTracking() public {
        incoin.issueCredential(
            student,
            InCoinCredential.CredentialType.ACADEMIC_DEGREE,
            sampleHash
        );
        incoin.issueCredential(
            student,
            InCoinCredential.CredentialType.VOLUNTEERING,
            sampleHash
        );

        uint256[] memory creds = incoin.getStudentCredentials(student);
        require(creds.length == 2, "Student should have 2 credentials");
        require(creds[0] == 1, "First token should be 1");
        require(creds[1] == 2, "Second token should be 2");
        require(incoin.totalCredentialsIssued() == 2, "Total count should be 2");
    }

    function test_Revocation() public {
        uint256 tokenId = incoin.issueCredential(
            student,
            InCoinCredential.CredentialType.DIPLOMA,
            sampleHash
        );

        require(incoin.isCredentialValid(tokenId), "Should be valid initially");

        incoin.revokeCredential(tokenId, "Revoked due to administrative error");

        InCoinCredential.Credential memory cred = incoin.getCredential(tokenId);
        require(cred.revoked, "Credential must be marked revoked");
        require(!incoin.isCredentialValid(tokenId), "Credential must be invalid");
    }

    function test_IssuerManagement() public {
        address newIssuer = address(0x9999999999999999999999999999999999999999);
        incoin.addIssuer(newIssuer);
        require(incoin.hasRole(incoin.ISSUER_ROLE(), newIssuer), "New issuer should have role");

        incoin.removeIssuer(newIssuer);
        require(!incoin.hasRole(incoin.ISSUER_ROLE(), newIssuer), "Issuer should be removed");
    }
}
