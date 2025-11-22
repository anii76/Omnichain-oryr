// Compute risk off-chain and call controller.sendRebalance to LZ target
require('dotenv').config();
const { ethers } = require('ethers');
const ControllerABI = [
"function computeRisk(bytes32,bytes32) public view returns (uint256)",
"function sendRebalance(uint16,bytes,bytes) external"
];


async function main(){
const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_CHAIN_A);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const controller = new ethers.Contract(process.env.CONTROLLER_ADDRESS, ControllerABI, wallet);


const BTC_FEED = '0x' + '00'.repeat(32);
const ETH_FEED = '0x' + '11'.repeat(32);


// compute on-chain risk (or compute off-chain and create payload)
const risk = await controller.computeRisk(BTC_FEED, ETH_FEED);
console.log('risk', risk.toString());


// simple decision: if risk > threshold send rebal
const threshold = 500; // 5%
if(risk.gt(threshold)){
// Build payload: token, user, amount, swapData (bytes)
const token = process.env.STABLE_TOKEN;
const user = process.env.USER_ADDRESS;
const amount = ethers.utils.parseUnits('10', 18);
const payload = ethers.utils.defaultAbiCoder.encode(['address','address','uint256','bytes'], [token, user, amount, '0x']);
const dstChainId = parseInt(process.env.DST_CHAIN_ID || '10002'); // LayerZero chain id example
const dstAddress = ethers.utils.arrayify(process.env.REBALANCER_ADDRESS);
await controller.sendRebalance(dstChainId, dstAddress, payload);
console.log('sent rebalance');
}
}


main();