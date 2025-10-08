const hre = require("hardhat");
const readline = require("readline");

// Replace with your deployed contract address
const CONTRACT_ADDRESS = "0xa42921Db715e260d17F53f50Cd13903DD0685020";

// Function to get user input from terminal
function ask(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => rl.question(question, (ans) => {
    rl.close();
    resolve(ans.trim());
  }));
}

// Simple Ethereum address validator
function isValidAddress(address) {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

async function main() {
  const QRCodePass = await hre.ethers.getContractFactory("QRCodePass");
  const qrCodePass = await QRCodePass.attach(CONTRACT_ADDRESS);

  console.log("Connected to QRCodePass contract at:", CONTRACT_ADDRESS);

  // Fetch available Hardhat accounts
  const accounts = await hre.ethers.getSigners();

  while (true) {
    console.log("\nOptions:");
    console.log("1. Issue a pass");
    console.log("2. Verify a pass by ID");
    console.log("3. Revoke a pass by ID");
    console.log("4. Exit");

    const choice = await ask("Enter your choice (1-4): ");

    if (choice === "1") {
      console.log("\nAvailable student accounts:");
      accounts.forEach((acc, idx) => {
        console.log(`${idx}: ${acc.address}`);
      });

      const idx = await ask("Enter student index or custom address: ");

      let studentAddress;
      if (/^\d+$/.test(idx) && accounts[Number(idx)]) {
        studentAddress = accounts[Number(idx)].address;
      } else if (isValidAddress(idx)) {
        studentAddress = idx;
      } else {
        console.log("Invalid input! Enter a valid index or Ethereum address.");
        continue;
      }

      const tx = await qrCodePass.issuePass(studentAddress);
      await tx.wait();
      console.log(`Pass issued to: ${studentAddress}`);
    }
    else if (choice === "2") {
      const id = await ask("Enter pass ID to verify: ");
      const isValid = await qrCodePass.verifyPass(id);
      console.log(`🔎 Pass ID ${id} valid? ${isValid}`);
    }
    else if (choice === "3") {
      const id = await ask("Enter pass ID to revoke: ");
      const tx = await qrCodePass.revokePass(id);
      await tx.wait();
      console.log(`Pass ID ${id} revoked`);
    }
    else if (choice === "4") {
      console.log("Exiting...");
      break;
    }
    else {
      console.log(" Invalid choice, try again!");
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
