// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@layerzerolabs/solidity-examples/contracts/lzApp/NonblockingLzApp.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/// @notice Minimal interface for 1inch Aggregation Router swap call wrapper
interface IAggregationRouterV4 {
    function swap(address executor, bytes calldata data) external payable returns (uint256 returnAmount);
}

contract Rebalancer is NonblockingLzApp, Ownable, ReentrancyGuard, Pausable {
    address public oneInchRouter;

    event RebalanceExecuted(address indexed recipient, address indexed token, uint256 amount, uint256 returned);
    event OneInchRouterSet(address indexed router);
    event ERC20Withdrawn(address token, address to, uint256 amount);

    constructor(address _endpoint, address _oneInch) NonblockingLzApp(_endpoint) {
        oneInchRouter = _oneInch;
    }

    modifier hasRouter() {
        require(oneInchRouter != address(0), "no router");
        _;
    }

    function setOneInch(address r) external onlyOwner {
        require(r != address(0), "zero");
        oneInchRouter = r;
        emit OneInchRouterSet(r);
    }

    /// @notice Low-level helper to approve token to router if necessary
    function _ensureApprove(address token, uint256 amount) internal {
        if (token == address(0)) return;
        IERC20 t = IERC20(token);
        // get allowance
        (bool ok, bytes memory data) = token.call(abi.encodeWithSignature("allowance(address,address)", address(this), oneInchRouter));
        uint256 allowance = 0;
        if (ok && data.length >= 32) allowance = abi.decode(data, (uint256));
        if (allowance < amount) {
            // set max allowance
            t.approve(oneInchRouter, type(uint256).max);
        }
    }

    /// @dev receive LayerZero messages and execute rebalance
    /// payload: abi.encode(address tokenIn, address user, uint256 amountIn, address tokenOut, uint256 minOut, bytes swapCalldata)
    function _nonblockingLzReceive(uint16, bytes memory, uint64, bytes memory payload) internal override whenNotPaused nonReentrant {
        (address tokenIn, address user, uint256 amountIn, address tokenOut, uint256 minOut, bytes memory swapCalldata) =
            abi.decode(payload, (address, address, uint256, address, uint256, bytes));

        require(user != address(0), "bad user");
        require(amountIn > 0, "bad amount");

        // if no router or no swap calldata, fallback to simple transfer of tokenIn back to user
        uint256 returned = 0;
        if (oneInchRouter == address(0) || swapCalldata.length == 0) {
            // transfer tokenIn to user
            if (tokenIn == address(0)) {
                payable(user).transfer(amountIn);
                returned = amountIn;
            } else {
                IERC20(tokenIn).transfer(user, amountIn);
                returned = amountIn;
            }
            emit RebalanceExecuted(user, tokenIn, amountIn, returned);
            return;
        }

        // ensure approval
        if (tokenIn != address(0)) _ensureApprove(tokenIn, amountIn);

        // call the 1inch aggregator with provided calldata (which encodes swap description and flags)
        (bool ok, bytes memory out) = oneInchRouter.call{value: 0}(swapCalldata);
        if (!ok) {
            // fallback: return tokenIn
            if (tokenIn == address(0)) payable(user).transfer(amountIn);
            else IERC20(tokenIn).transfer(user, amountIn);
            emit RebalanceExecuted(user, tokenIn, amountIn, 0);
            return;
        }

        // try decode returned amount (best-effort, depends on router)
        if (out.length >= 32) returned = abi.decode(out, (uint256));

        // If tokenOut is non-zero, transfer tokenOut to user (assumes router transferred tokens to this contract)
        if (tokenOut != address(0)) {
            uint256 bal = IERC20(tokenOut).balanceOf(address(this));
            if (bal > 0) {
                IERC20(tokenOut).transfer(user, bal);
            }
        }

        emit RebalanceExecuted(user, tokenIn, amountIn, returned);
    }

    /// @notice owner can withdraw arbitrary ERC20s sent to this contract
    function withdrawERC20(address token, address to, uint256 amount) external onlyOwner {
        require(to != address(0), "zero");
        IERC20(token).transfer(to, amount);
        emit ERC20Withdrawn(token, to, amount);
    }

    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }
}

// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@layerzerolabs/solidity-examples/contracts/lzApp/NonblockingLzApp.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Rebalancer is NonblockingLzApp, Ownable, ReentrancyGuard {
    address public oneInchRouter;

    event RebalanceExecuted(address recipient, address token, uint256 amount);

    constructor(address _endpoint, address _oneInch) NonblockingLzApp(_endpoint) {
        oneInchRouter = _oneInch;
    }

    function setOneInch(address r) external onlyOwner {
        require(r != address(0), "zero");
        oneInchRouter = r;
    }

    function _nonblockingLzReceive(
        uint16,
        bytes memory,
        uint64,
        bytes memory payload
    ) internal override nonReentrant {
        (address token, address user, uint256 amount, bytes memory swapData) =
            abi.decode(payload, (address, address, uint256, bytes));

        require(user != address(0), "bad user");
        require(amount > 0, "bad amount");

        IERC20(token).transfer(user, amount);
        emit RebalanceExecuted(user, token, amount);
    }

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
