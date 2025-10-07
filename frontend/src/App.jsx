import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import * as QRCodeModule from 'qrcode.react';
import GuardScanner from './GuardScanner'; 
import './App.css';

// 🚀 FINAL, SYNCHRONIZED CONTRACT ADDRESS
const CONTRACT_ADDRESS = "0xa42921Db715e260d17F53f50Cd13903DD0685020";
// ABI array from QRCodePass.json
const CONTRACT_ABI = [
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "id", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "student", "type": "address" }
    ],
    "name": "PassIssued",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "id", "type": "uint256" }
    ],
    "name": "PassRevoked",
    "type": "event"
  },
  {
    "inputs": [{ "internalType": "address", "name": "student", "type": "address" }],
    "name": "issuePass",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "nextId",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "name": "passes",
    "outputs": [
      { "internalType": "uint256", "name": "id", "type": "uint256" },
      { "internalType": "address", "name": "student", "type": "address" },
      { "internalType": "bool", "name": "valid", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "id", "type": "uint256" }],
    "name": "revokePass",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "id", "type": "uint256" }],
    "name": "verifyPass",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  // Added the owner function for reading access
  {
    "inputs": [],
    "name": "owner",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  }
];

function App() {
    const QRCode = QRCodeModule.default || QRCodeModule;
    const [currentAccount, setCurrentAccount] = useState(null);
    const [contract, setContract] = useState(null);
    const [status, setStatus] = useState('');
    const [qrData, setQrData] = useState(null);
    const [nextPassId, setNextPassId] = useState(0);
    const [isGuardView, setIsGuardView] = useState(false); 

    // Helper to connect wallet and contract
    const connectWallet = async () => {
      try {
        if (!window.ethereum) {
          setStatus('❌ MetaMask not detected. Please install it!');
          return;
        }

        const AmoyChainId = '0x13882'; 
        
        // CRITICAL: Force network switch before proceeding
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: AmoyChainId }],
        });

        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        
        // Use a temporary read-only contract instance to fetch the owner
        const readProvider = new ethers.JsonRpcProvider("https://rpc-amoy.polygon.technology"); 
        const readContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, readProvider);
        
        const contractOwner = await readContract.owner(); // READ THE OWNER FROM BLOCKCHAIN
        
        console.log("Contract Deployer (Owner):", contractOwner);
        console.log("Currently Connected Wallet:", address);

        if (contractOwner.toLowerCase() !== address.toLowerCase()) {
            setStatus(`⚠️ WARNING: Connected wallet is not the Contract Owner (${contractOwner}). Issue/Revoke will fail.`);
        } else {
            setStatus('✅ Wallet connected. You are the Contract Owner.');
        }

        // Final setup
        const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        setContract(contractInstance);
        setCurrentAccount(address);
        
        const nextId = await contractInstance.nextId();
        setNextPassId(Number(nextId.toString()));

      } catch (error) {
        console.error("Connection Error:", error);
        if (error.code === 4001) {
            setStatus('❌ Connection rejected. Approve the network switch in MetaMask.');
        } else {
            setStatus('❌ Error connecting wallet. Check console.');
        }
      }
    };

    useEffect(() => {
        // Only attempt connection if we are not in guard view
        if (!isGuardView) {
            connectWallet();
        }
    }, [isGuardView]); 

    // Handler for issuing a pass (Student/Owner creates their pass)
    const handleIssuePass = async () => {
      if (!contract || !currentAccount) {
        setStatus('Please connect your wallet first.');
        return;
      }
      
      try {
          setStatus(`Issuing pass to ${currentAccount}...`);
          
          // Transaction should now succeed!
          const tx = await contract.issuePass(currentAccount); 
          await tx.wait();
          
          const issuedPassId = nextPassId; 
          
          const qrPassData = JSON.stringify({ 
              id: issuedPassId, 
              owner: currentAccount 
          });
          
          setQrData(qrPassData);
          setNextPassId(issuedPassId + 1);
          setStatus(`🎉 Pass ID ${issuedPassId} issued successfully!`);
          
      } catch (error) {
        console.error("Transaction Error:", error);
        setStatus(`❌ Transaction failed. Ensure you are the contract owner and have enough MATIC.`);
      }
    };
    
    // Conditionally render the connect button if not connected and not in guard view
    if (!currentAccount && !isGuardView) {
        return (
            <div className="App">
                <h1>CampusKey Pass System 🗝️</h1>
                <p>Status: {status || 'Connect your wallet to begin.'}</p>
                <button onClick={connectWallet}>Connect MetaMask</button>
                <button onClick={() => setIsGuardView(true)} style={{marginLeft: '10px'}}>
                    → Switch to Guard Scanner View
                </button>
            </div>
        );
    }

    return (
      <div className="App">
          <h1>CampusKey 🗝️</h1>
          
          <button onClick={() => setIsGuardView(!isGuardView)} style={{ marginBottom: '20px' }}>
              {isGuardView ? '← Switch to Pass Issuer/Owner View' : '→ Switch to Guard Scanner View'}
          </button>
          
          {isGuardView ? (
              // GUARD VIEW
              <GuardScanner /> 
          ) : (
              // ISSUER/OWNER VIEW
              <>
                  <p>Status: {status}</p>
                  <p>Connected As: **{currentAccount}**</p>
                  <p>Next Pass ID to be Issued: **{nextPassId}**</p>

                  <h2>1. Issue & Generate Pass QR</h2>
                  <button onClick={handleIssuePass} disabled={!contract}>
                      Issue New Pass
                  </button>
                  
                  {qrData && (
                      <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '8px' }}>
                          <h3>Pass ID {nextPassId - 1} QR Code</h3>
                          <QRCode value={qrData} size={256} level="H" includeMargin={true} />
                          <p style={{marginTop: '10px', fontSize: 'small'}}>
                              Data: <code>{qrData}</code>
                          </p>
                          <p style={{color: 'green', fontWeight: 'bold'}}>Pass is now registered on-chain!</p>
                      </div>
                  )}
              </>
          )}
      </div>
    );
}

export default App;
