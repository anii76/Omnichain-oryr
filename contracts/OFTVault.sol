// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@layerzerolabs/solidity-examples/contracts/token/oft/OFT.sol";
import "@layerzerolabs/solidity-examples/contracts/token/oft/NonblockingOFT.sol";


// Simple OFT-based Vault that allows deposits and authorized cross-chain send
contract OFTVault is NonblockingOFT {
address public controller;
mapping(address => uint256) public balances;


constructor(string memory _name, string memory _symbol, address _lzEndpoint) NonblockingOFT(_name, _symbol, 18, _lzEndpoint) {}


modifier onlyController() {
require(msg.sender == controller, "only controller");
_;
}


function setController(address c) external {
require(controller == address(0) || msg.sender == controller, "only once or controller");
controller = c;
}


function deposit(uint256 amount) external {
// For hackathon simplicity, assume vault token is minted by caller approving this contract
_burn(msg.sender, amount); // this is placeholder: adapt to your token semantics
balances[msg.sender] += amount;
}


// Controller can instruct cross-chain move of user's balance
function sendCrossChain(address to, uint16 dstChainId, bytes memory dstAddress, uint256 amount) external onlyController {
// Use OFT sendFrom semantics
_send(dstChainId, dstAddress, amount, payable(msg.sender), address(0), bytes(""));
}


// _nonblockingLzReceive called on inbound LZ messages (handled by NonblockingOFT)
function _nonblockingLzReceive(uint16, bytes memory, uint64, bytes memory) internal virtual override {
// accept incoming OFT tokens - NonblockingOFT handles
}
}