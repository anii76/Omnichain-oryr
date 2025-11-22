// Minimal script: fetch price from Hermes and call Controller.updatePrice(feedId, price)
require('dotenv').config();
const axios = require('axios');
const { ethers } = require('ethers');
const ControllerABI = ["function updatePrice(bytes32,uint256) external"];


async function fetchPrice(feedIdHex){
const url = `${process.env.PYTH_HERMES_URL}/price?id=${feedIdHex}`; // placeholder; adapt to real Hermes API
const r = await axios.get(url).catch(()=>null);
if(!r || !r.data) return null;
return r.data.price; // adapt
}


async function main(){
const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_CHAIN_A);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const controller = new ethers.Contract(process.env.CONTROLLER_ADDRESS, ControllerABI, wallet);


// Example feedId (replace with real pyth feed ids)
const BTC_FEED = '0x' + '00'.repeat(32);
const ETH_FEED = '0x' + '11'.repeat(32);


const btcPrice = await fetchPrice(BTC_FEED);
const ethPrice = await fetchPrice(ETH_FEED);
if(btcPrice) await controller.updatePrice(BTC_FEED, ethers.utils.parseUnits(String(btcPrice), 8));
if(ethPrice) await controller.updatePrice(ETH_FEED, ethers.utils.parseUnits(String(ethPrice), 8));
}


main();