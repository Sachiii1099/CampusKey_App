import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from "html5-qrcode";
import { ethers } from 'ethers';

// ⚠️ Use your deployed contract details
const CONTRACT_ADDRESS = "0xa42921Db715e260d17F53f50Cd13903DD0685020";
const CONTRACT_ABI = [
    // ABI array from QRCodePass.json (Full ABI for robustness)
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

function GuardScanner() {
    const [scanResult, setScanResult] = useState('Awaiting QR Scan...');
    const [verificationStatus, setVerificationStatus] = useState(null);

    useEffect(() => {
        const scanner = new Html5QrcodeScanner(
            "reader", 
            { 
                qrbox: { width: 250, height: 250 }, 
                fps: 10 
            },
            /* verbose= */ false
        );

        const onScanSuccess = async (decodedText, decodedResult) => {
            scanner.pause(true); 
            setScanResult(`Scanned: ${decodedText}`);

            try {
                // 1. PARSE QR DATA
                const data = JSON.parse(decodedText);
                const passId = data.id;
                const studentOwner = data.owner || "N/A";
                
                console.log("--- START VERIFICATION ---");
                console.log("Scanning Pass ID:", passId);

                if (passId === undefined) {
                    setVerificationStatus({ result: false, message: 'QR data missing Pass ID.' });
                    setTimeout(() => scanner.resume(), 3000); 
                    return;
                }

                // 2. CONNECT TO BLOCKCHAIN
                const readProvider = new ethers.JsonRpcProvider("https://rpc-amoy.polygon.technology"); 
                const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, readProvider);

                // 3. VERIFY ON-CHAIN
                const isValid = await contract.verifyPass(passId);
                console.log("Contract verifyPass result:", isValid);

                if (isValid) {
                    // --- ACCESS GRANTED ---
                    setVerificationStatus({ 
                        result: true, 
                        message: `✅ ACCESS GRANTED (Pass ID ${passId}) for: ${studentOwner}` 
                    });
                } else {
                    // --- ACCESS DENIED ---
                    setVerificationStatus({ 
                        result: false, 
                        message: `❌ ACCESS DENIED. Pass ID ${passId} is REVOKED or NON-EXISTENT.` 
                    });
                }
            } catch (error) {
                console.error("Verification Error:", error);
                setVerificationStatus({ result: false, message: '❌ Error: Invalid QR format or RPC network failure.' });
            }
            // Resume scanning after 3 seconds 
            setTimeout(() => scanner.resume(), 3000); 
        };

        const onScanFailure = (error) => {
            // Keep scanning
        };

        scanner.render(onScanSuccess, onScanFailure);
        
        return () => {
            scanner.clear().catch(e => {}); 
        };
    }, []);

    return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            <h2>Guard Scan Verification 🛡️</h2>
            <p style={{marginBottom: '15px'}}>Hold a CampusKey QR Code up to the camera.</p>
            <div id="reader" style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}></div>
            <p style={{marginTop: '15px'}}>Scan Status: **{scanResult}**</p>
            {verificationStatus && (
                <div style={{
                    marginTop: '15px',
                    padding: '15px',
                    backgroundColor: verificationStatus.result ? '#155724' : '#721c24',
                    color: 'white',
                    border: verificationStatus.result ? '1px solid #c3e6cb' : '1px solid #f5c6cb',
                    borderRadius: '8px',
                    fontWeight: 'bold'
                }}>
                    {verificationStatus.message}
                </div>
            )}
        </div>
    );
}

export default GuardScanner;
