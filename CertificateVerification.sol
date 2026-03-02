// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CertificateVerification {

    mapping(string => bool) private certificates;
    address public admin;

    constructor() {
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not authorized");
        _;
    }

    function addCertificate(string memory hash) public onlyAdmin {
        certificates[hash] = true;
    }

    function verifyCertificate(string memory hash) public view returns (bool) {
        return certificates[hash];
    }
}