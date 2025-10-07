CampusKey: Decentralized QR Verification
Welcome to the CampusKey project! This is a Decentralized Application (DApp) designed to provide secure, verifiable, and trustless access control using Smart Contracts and QR codes. The system leverages the Polygon Amoy Testnet for low-cost, fast transactions.

🚀 Key Features
Decentralized Access Control: Pass validity is stored immutably on the Polygon blockchain.

Secure Issuance: Only the contract owner (administrator) can issue or revoke passes via an authenticated web interface.

QR Code Verification: A dedicated Guard Scanner view uses the device camera to instantly verify the pass status on-chain.

Owner Mismatch Guard: The system is protected by the onlyOwner modifier in Solidity, preventing unauthorized pass administration.

💻 Tech Stack
Component

Technology

Role

Blockchain

Solidity (v0.8.28)

Smart Contract logic and state management.

Network

Polygon Amoy Testnet

EVM-compatible chain for testing.

Backend/DevOps

Hardhat (v2.17.0), Ethers.js

Contract deployment, testing, and administration via scripts.

Frontend

React (Vite)

Single-Page Application (SPA) user interface.

Web3 Interface

Ethers.js (v6)

Connecting the frontend to MetaMask and the blockchain.

QR Code

qrcode.react, html5-qrcode

Generation and camera-based scanning.

⚙️ Setup and Installation
Follow these steps to set up and run the project locally.

Prerequisites
Node.js (v18+) and npm

MetaMask Browser Extension configured with the Polygon Amoy Testnet (Chain ID: 80002).

1. Backend (Smart Contract) Setup
Navigate to the project root directory and install Hardhat dependencies:

npm install

2. Frontend (React DApp) Setup
Navigate to the frontend directory and install React/Web3 dependencies:

cd frontend
npm install

3. Configuration (.env File)
Create a file named .env in the project root (CampusKey/) to hold your private keys (hidden from Git via .gitignore).

# Replace with the private key of your MetaMask deployer account (0x6c74E...c814)
PRIVATE_KEY="YOUR_DEPLOYER_PRIVATE_KEY_HERE"

# Optional: For contract verification on Polygonscan
POLYGONSCAN_API_KEY="YOUR_POLYGONSCAN_API_KEY_HERE"

4. Deployment and Synchronization (CRITICAL STEP)
The contract must be deployed by your owner account.

# From project root:
npx hardhat compile

# Deploy the contract and get the new address
npx hardhat run scripts/deploy.js --network amoy

# ⚠️ After deployment, update the CONTRACT_ADDRESS in:
# 1. frontend/src/App.jsx
# 2. frontend/src/GuardScanner.jsx
# 3. scripts/interact.js

🚀 Running the Application
1. Run the Frontend (Issuer/Guard Views)
cd frontend
npm run dev
# Access the app at http://localhost:5173/

2. Issuing and Verification Flow
The transaction write path requires Amoy MATIC funds in your MetaMask wallet.

A. Issue a Pass (Admin Function)

Frontend Method (Recommended): Click "Connect MetaMask" then "Issue New Pass." (Requires funds in MetaMask).

Terminal Method (Stable Write): Used when the frontend transaction fails due to local instability.

# From project root
npx hardhat run scripts/interact.js --network amoy
# Choose option 1 and enter the index of your deployer account (usually 0).

B. Verify the Pass (Guard Function)

Switch to "Guard Scanner View" on the web application.

Display the QR code of a validly issued Pass ID (e.g., ID 3) to your webcam.

The application will display ✅ ACCESS GRANTED.

CampusKey: Decentralized QR Verification
A project developed by Sachiii1099.
