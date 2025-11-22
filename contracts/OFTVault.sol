// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;
import "@layerzerolabs/solidity-examples/contracts/token/oft/v2/OFTV2.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title OFTVault
 * @dev Vault that wraps an underlying ERC20 stable token and mints an OFT share token to depositors.
 *      Shares are transferable and can be moved cross-chain via LayerZero by the controller.
 */
contract OFTVault is OFTV2, ReentrancyGuard {
    IERC20 public immutable underlying;
    address public controller;

    event Deposited(address indexed user, uint256 amount, uint256 shares);
    event Withdrawn(address indexed user, uint256 amount, uint256 shares);
    event ControllerSet(address indexed controller);
    event CrossChainSent(address indexed from, uint16 dstChainId, bytes dstAddress, uint256 amount);

    constructor(
        string memory _name,
        string memory _symbol,
        address _lzEndpoint,
        address _underlying
    ) OFTV2(_name, _symbol, 8, _lzEndpoint) {
        require(_underlying != address(0), "zero underlying");
        underlying = IERC20(_underlying);
    }

    modifier onlyController() {
        require(msg.sender == controller, "only controller");
        _;
    }

    function setController(address c) external onlyOwner {
        require(c != address(0), "zero");
        controller = c;
        emit ControllerSet(c);
    }

    /// @notice deposit underlying tokens and receive share OFT tokens
    function deposit(uint256 amount) external nonReentrant returns (uint256 shares) {
        require(amount > 0, "amount>0");
        // transfer underlying in
        require(underlying.transferFrom(msg.sender, address(this), amount), "transfer failed");
        // mint 1:1 shares for simplicity (can be improved to reflect TVL)
        shares = amount;
        _mint(msg.sender, shares);
        emit Deposited(msg.sender, amount, shares);
    }

    /// @notice withdraw underlying by burning shares
    function withdraw(uint256 shareAmount) external nonReentrant returns (uint256 amount) {
        require(shareAmount > 0, "share>0");
        // burn the caller's share tokens
        _burn(msg.sender, shareAmount);
        amount = shareAmount;
        require(underlying.transfer(msg.sender, amount), "transfer failed");
        emit Withdrawn(msg.sender, amount, shareAmount);
    }

    /// @notice Controller can send shares cross-chain on behalf of a user
    /// @dev This burns the shares on this chain and sends payload to dst chain
    function sendCrossChainFrom(
        address from,
        uint16 dstChainId,
        bytes32 toAddress,
        uint256 shareAmount,
        address payable refundAddress,
        address zroPaymentAddress,
        bytes calldata adapterParams
    ) external payable onlyController nonReentrant {
        require(shareAmount > 0, "share>0");
        // Use the OFT's sendFrom which handles burning
        _send(from, dstChainId, toAddress, shareAmount, refundAddress, zroPaymentAddress, adapterParams);
        emit CrossChainSent(from, dstChainId, abi.encodePacked(toAddress), shareAmount);
    }

    // Allow the owner/controller to mint in exceptional cases (e.g., bridging inflow)
    function adminMint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    // Override _creditTo to handle incoming OFT tokens if needed
    function _creditTo(uint16 _srcChainId, address _toAddress, uint _amount) internal virtual override returns(uint) {
        // OFTV2 handles minting the tokens automatically
        // You can add custom logic here if needed
        return super._creditTo(_srcChainId, _toAddress, _amount);
    }
}