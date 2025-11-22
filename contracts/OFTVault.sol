// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;
mport "@layerzerolabs/solidity-examples/contracts/token/oft/NonblockingOFT.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title OFTVault
 * @dev Vault that wraps an underlying ERC20 stable token and mints an OFT share token to depositors.
 *      Shares are transferable and can be moved cross-chain via LayerZero by the controller.
 */
contract OFTVault is NonblockingOFT, Ownable, ReentrancyGuard {
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
    ) NonblockingOFT(_name, _symbol, 18, _lzEndpoint) {
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
        bytes calldata dstAddress,
        uint256 shareAmount,
        bytes calldata adapterParams
    ) external onlyController nonReentrant {
        require(shareAmount > 0, "share>0");
        // burn sender shares (assume controller has allowance to burn via some governance flow)
        _burn(from, shareAmount);
        // send the amount as OFT payload; this uses underlying OFT send semantics
        _send(dstChainId, dstAddress, shareAmount, payable(msg.sender), address(0), adapterParams);
        emit CrossChainSent(from, dstChainId, dstAddress, shareAmount);
    }

    // Allow the owner/controller to mint in exceptional cases (e.g., bridging inflow)
    function adminMint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    // Receive inbound OFT tokens: NonblockingOFT._nonblockingLzReceive will credit tokens via _creditTo
    function _nonblockingLzReceive(
        uint16 _srcChainId,
        bytes memory _srcAddress,
        uint64 _nonce,
        bytes memory _payload
    ) internal virtual override {
        // For OFT, NonblockingOFT handles crediting minted amounts via _creditTo
        // leave empty or add custom logic for on-receive hooks
    }
}