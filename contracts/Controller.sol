// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;
import "@layerzerolabs/solidity-examples/contracts/lzApp/NonblockingLzApp.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract Controller is NonblockingLzApp, Ownable, ReentrancyGuard, Pausable {
    // Pyth feed storage
    mapping(bytes32 => uint256) public lastPrice;
    mapping(address => bool) public updaters; // authorized off-chain pushers

    // simple queue for scheduled rebalances (small hackathon-ready queue)
    struct RebalanceJob {
        uint16 dstChainId;
        bytes dstAddress;
        bytes payload;
        uint256 eta;
        bool executed;
    }
    RebalanceJob[] public jobs;

    event PriceUpdated(bytes32 indexed feedId, uint256 price, address indexed updater);
    event UpdaterSet(address indexed updater, bool allowed);
    event RebalanceSent(uint16 indexed dstChainId, bytes dstAddress, bytes payload);
    event RebalanceScheduled(uint256 indexed jobId, uint256 eta);
    event JobExecuted(uint256 indexed jobId);

    modifier onlyUpdater() {
        require(updaters[msg.sender] || owner() == msg.sender, "not updater");
        _;
    }

    constructor(address _endpoint) NonblockingLzApp(_endpoint) {}

    /// @notice set or unset an off-chain updater address (e.g., backend pushing Pyth data)
    function setUpdater(address who, bool allowed) external onlyOwner {
        updaters[who] = allowed;
        emit UpdaterSet(who, allowed);
    }

    /// @notice off-chain systems call this to push a price update (authorized)
    function updatePrice(bytes32 feedId, uint256 price) external onlyUpdater whenNotPaused nonReentrant {
        require(price > 0, "invalid price");
        lastPrice[feedId] = price;
        emit PriceUpdated(feedId, price, msg.sender);
    }

    /// @notice batch update many feeds in one tx
    function batchUpdatePrice(bytes32[] calldata feedIds, uint256[] calldata prices) external onlyUpdater whenNotPaused nonReentrant {
        require(feedIds.length == prices.length, "len mismatch");
        for (uint256 i = 0; i < feedIds.length; i++) {
            require(prices[i] > 0, "invalid price");
            lastPrice[feedIds[i]] = prices[i];
            emit PriceUpdated(feedIds[i], prices[i], msg.sender);
        }
    }

    /// @notice compute a risk metric (basis points) between two feeds; extendable
    function computeRisk(bytes32 feedA, bytes32 feedB) public view returns (uint256) {
        uint256 a = lastPrice[feedA];
        uint256 b = lastPrice[feedB];
        if (a == 0 || b == 0) return 0;
        uint256 diff = a > b ? a - b : b - a;
        return (diff * 10000) / a; // basis points
    }

    /// @notice immediate send to dst chain via LayerZero (owner only)
    function sendRebalance(
        uint16 _dstChainId,
        bytes calldata _dstAddress,
        bytes calldata payload
    ) external onlyOwner whenNotPaused nonReentrant {
        require(payload.length > 0, "empty payload");
        _lzSend(_dstChainId, _dstAddress, payload, payable(msg.sender), address(0), bytes(""));
        emit RebalanceSent(_dstChainId, _dstAddress, payload);
    }

    /// @notice schedule a rebalance to be executed after `delay` seconds by calling executeJob
    function scheduleRebalance(
        uint16 _dstChainId,
        bytes calldata _dstAddress,
        bytes calldata payload,
        uint256 delay
    ) external onlyOwner whenNotPaused returns (uint256 jobId) {
        jobId = jobs.length;
        jobs.push(RebalanceJob({dstChainId: _dstChainId, dstAddress: _dstAddress, payload: payload, eta: block.timestamp + delay, executed: false}));
        emit RebalanceScheduled(jobId, block.timestamp + delay);
    }

    /// @notice execute a scheduled job (anyone can call, owner will be payer)
    function executeJob(uint256 jobId) external whenNotPaused nonReentrant returns (bool) {
        require(jobId < jobs.length, "invalid job");
        RebalanceJob storage j = jobs[jobId];
        require(!j.executed, "already");
        require(block.timestamp >= j.eta, "too early");
        j.executed = true;
        _lzSend(j.dstChainId, j.dstAddress, j.payload, payable(msg.sender), address(0), bytes(""));
        emit JobExecuted(jobId);
        return true;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // emergency withdraw: owner can withdraw any stuck funds from this contract
    function emergencyWithdraw(address token, address to, uint256 amount) external onlyOwner nonReentrant {
        require(to != address(0), "zero");
        if (token == address(0)) {
            payable(to).transfer(amount);
        } else {
            (bool ok, ) = token.call(abi.encodeWithSignature("transfer(address,uint256)", to, amount));
            require(ok, "transfer failed");
        }
    }

    /// @dev no inbound LZ logic required here for now
    function _nonblockingLzReceive(uint16, bytes memory, uint64, bytes memory) internal virtual override {}
}
