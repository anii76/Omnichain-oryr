
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



import "@layerzerolabs/solidity-examples/contracts/lzApp/NonblockingLzApp.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";


interface IOneInchRouter {
function swap(address caller, IOneInchExchange[] calldata exchanges, address to, uint256 value) external payable returns (uint256 returnAmount, uint256 spentAmount);
}


contract Rebalancer is NonblockingLzApp {
address public owner;
}