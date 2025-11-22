// Contract ABIs - simplified versions for frontend use
export const VAULT_ABI = [
  "function deposit(uint256 amount) external returns (uint256 shares)",
  "function withdraw(uint256 shareAmount) external returns (uint256 amount)",
  "function balanceOf(address account) external view returns (uint256)",
  "function underlying() external view returns (address)",
  "function totalSupply() external view returns (uint256)",
  "event Deposited(address indexed user, uint256 amount, uint256 shares)",
  "event Withdrawn(address indexed user, uint256 amount, uint256 shares)",
] as const;

export const CONTROLLER_ABI = [
  "function lastPrice(bytes32 feedId) external view returns (uint256)",
  "function computeRisk(bytes32 feedA, bytes32 feedB) external view returns (uint256)",
  "event PriceUpdated(bytes32 indexed feedId, uint256 price, address indexed updater)",
] as const;

export const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
  "function decimals() external view returns (uint8)",
  "function symbol() external view returns (string)",
  "function name() external view returns (string)",
] as const;

