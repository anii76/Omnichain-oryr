import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";


const ControllerModule = buildModule("ControllerModule", (m) => {
const lzEndpoint = m.getParameter("lzEndpoint", "0x0000000000000000000000000000000000000000");
const controller = m.contract("Controller", [lzEndpoint]);
return { controller };
});


export default ControllerModule;