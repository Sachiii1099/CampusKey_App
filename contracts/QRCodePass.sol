// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract QRCodePass {
    struct Pass {
        uint256 id;
        address student;
        bool valid;
    }

    // New: Variable to store the deployer's address
    address public owner; 
    uint256 public nextId;
    mapping(uint256 => Pass) public passes;

    event PassIssued(uint256 indexed id, address indexed student);
    event PassRevoked(uint256 indexed id);

    // New: Constructor sets the deployer as the owner
    constructor() {
        owner = msg.sender;
    }

    // New: Modifier to restrict functions to the owner
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function.");
        _;
    }

    // Added onlyOwner modifier
    function issuePass(address student) external onlyOwner {
        passes[nextId] = Pass(nextId, student, true);
        emit PassIssued(nextId, student);
        nextId++;
    }

    function verifyPass(uint256 id) external view returns (bool) {
        return passes[id].valid;
    }

    // Added onlyOwner modifier
    function revokePass(uint256 id) external onlyOwner {
        require(passes[id].valid, "Pass is already invalid");
        passes[id].valid = false;
        emit PassRevoked(id);
    }
}
