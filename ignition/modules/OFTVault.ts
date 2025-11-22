import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";


const OFTVaultModule = buildModule("OFTVaultModule", (m) => {
  const name = m.getParameter("name", "ORYR Vault");
  const symbol = m.getParameter("symbol", "ORYR");
  const lzEndpoint = m.getParameter("lzEndpoint", "0x0000000000000000000000000000000000000000");
  const underlying = m.getParameter("underlying", "0x0000000000000000000000000000000000000000");

  const vault = m.contract("OFTVault", [name, symbol, lzEndpoint, underlying]);

  return { vault };
});


export default OFTVaultModule;

