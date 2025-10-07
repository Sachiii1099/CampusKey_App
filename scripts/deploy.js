const hre = require("hardhat");

async function main() {
  const QRCodePass = await hre.ethers.getContractFactory("QRCodePass");
  const qrCodePass = await QRCodePass.deploy();

  await qrCodePass.waitForDeployment();

  console.log("✅ QRCodePass deployed to:", await qrCodePass.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
