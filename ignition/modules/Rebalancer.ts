import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";


const RebalancerModule = buildModule("RebalancerModule", (m) => {
const lzEndpoint = m.getParameter("lzEndpoint", "0x0000000000000000000000000000000000000000");
const oneInch = m.getParameter("oneInch", "0x0000000000000000000000000000000000000000");


const rebalancer = m.contract("Rebalancer", [lzEndpoint, oneInch]);
return { rebalancer };
});


export default RebalancerModule;