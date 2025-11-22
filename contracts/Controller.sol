// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;


import "@layerzerolabs/solidity-examples/contracts/lzApp/NonblockingLzApp.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";


interface IRebalancer {
function executeRebalance(bytes calldata payload) external;
}


contract Controller is NonblockingLzApp, Ownable, ReentrancyGuard {
// Pyth feed storage
mapping(bytes32 => uint256) public lastPrice;


event PriceUpdated(bytes32 feedId, uint256 price);
event RebalanceSent(uint16 dstChainId, bytes dstAddress, bytes payload);


constructor(address _endpoint) NonblockingLzApp(_endpoint) {}


function updatePrice(bytes32 feedId, uint256 price) external onlyOwner nonReentrant {
require(price > 0, "invalid price");
lastPrice[feedId] = price;
emit PriceUpdated(feedId, price);
}


function computeRisk(bytes32 feedA, bytes32 feedB) public view returns (uint256) {
uint256 a = lastPrice[feedA];
uint256 b = lastPrice[feedB];
if (a == 0 || b == 0) return 0;
uint256 diff = a > b ? a - b : b - a;
return (diff * 10000) / a; // returns basis points
}


function sendRebalance(
uint16 _dstChainId,
bytes calldata _dstAddress,
bytes calldata payload
) external onlyOwner nonReentrant {
require(payload.length > 0, "empty payload");
_lzSend(
_dstChainId,
_dstAddress,
payload,
payable(msg.sender),
address(0),
bytes("")
);
emit RebalanceSent(_dstChainId, _dstAddress, payload);
}


function _nonblockingLzReceive(
uint16,
bytes memory,
uint64,
bytes memory
) internal virtual override {}
}