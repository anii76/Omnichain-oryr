// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;


import "@layerzerolabs/solidity-examples/contracts/lzApp/NonblockingLzApp.sol";


interface IRebalancer {
function executeRebalance(bytes calldata payload) external;
}


contract Controller is NonblockingLzApp {
address public owner;
// Store minimal price data / risk scores
mapping(bytes32 => uint256) public lastPrice; // feedId => price


event PriceUpdated(bytes32 feedId, uint256 price);
event RebalanceSent(uint16 dstChainId, bytes dstAddress, bytes payload);


modifier onlyOwner(){ require(msg.sender==owner); _; }


constructor(address _endpoint) NonblockingLzApp(_endpoint) {
owner = msg.sender;
}


function updatePrice(bytes32 feedId, uint256 price) external onlyOwner {
lastPrice[feedId] = price;
emit PriceUpdated(feedId, price);
}


// compute a simple risk score (example on-chain): percentage change between two feed IDs
function computeRisk(bytes32 feedA, bytes32 feedB) public view returns (uint256) {
uint256 a = lastPrice[feedA];
uint256 b = lastPrice[feedB];
if (a==0) return 0;
if (a>b) return (a - b) * 100 / a; else return (b - a) * 100 / a;
}


// send a rebalancing instruction to another chain's Rebalancer contract
function sendRebalance(uint16 _dstChainId, bytes calldata _dstAddress, bytes calldata payload) external onlyOwner {
_lzSend(_dstChainId, _dstAddress, payload, payable(msg.sender), address(0), bytes(""));
emit RebalanceSent(_dstChainId, _dstAddress, payload);
}


// handle inbound LZ messages (if needed)
function _nonblockingLzReceive(uint16, bytes memory, uint64, bytes memory) internal virtual override {
// For demo, ignore
}
}