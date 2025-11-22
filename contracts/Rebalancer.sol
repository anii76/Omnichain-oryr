// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@layerzerolabs/solidity-examples/contracts/lzApp/NonblockingLzApp.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";


interface IOneInchRouter {
function swap(address caller, IOneInchExchange[] calldata exchanges, address to, uint256 value) external payable returns (uint256 returnAmount, uint256 spentAmount);
}


contract Rebalancer is NonblockingLzApp {
address public owner;
address public oneInchRouter;


event RebalanceExecuted(address recipient, address token, uint256 amount);


constructor(address _endpoint, address _oneInch) NonblockingLzApp(_endpoint) {
owner = msg.sender;
oneInchRouter = _oneInch;
}


// LayerZero forwards the payload to this function via _nonblockingLzReceive
function _nonblockingLzReceive(uint16, bytes memory, uint64, bytes memory payload) internal override {
// payload format: abi.encode(address token, address user, uint256 amount, bytes swapData)
(address token, address user, uint256 amount, bytes memory swapData) = abi.decode(payload, (address,address,uint256,bytes));
// For simplicity, assume ERC20 already approved to this contract from vault or controller
// Execute swap via 1inch by calling router (simplified; 1inch interface varies)
// For hackathon, we'll just forward tokens to user
IERC20(token).transfer(user, amount);
emit RebalanceExecuted(user, token, amount);
}


// helper to update router
function setOneInch(address r) external { require(msg.sender==owner); oneInchRouter = r; }
}