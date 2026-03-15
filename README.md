# 🔐 CERTISHIELD

Blockchain-Based Certificate Verification System

CERTISHIELD is a decentralized Web3 application that prevents certificate fraud by storing SHA-256 certificate hashes on the Ethereum Sepolia test network.

---

## 🌐 Live Demo

**[https://certishield.vercel.app](https://certishield.vercel.app)**

---

## 🚀 Features

- 📄 Register certificate hashes on blockchain
- 🔒 Prevent tampering or forgery
- 🔍 Verify certificate authenticity publicly
- ⛓ Provide immutable proof via Etherscan
- 🖥 Professional dark UI with drag-and-drop file upload
- 🔔 Real-time toast notifications and transaction feedback

---

## 🧠 How It Works

1. User uploads a certificate (PDF).
2. The file is hashed using SHA-256 in the browser.
3. The hash is stored on Ethereum Sepolia via smart contract.
4. During verification, uploaded file is hashed again.
5. If hash matches blockchain record → Certificate is authentic.

No actual certificates are stored on-chain.

---

## 🛠 Tech Stack

- Solidity (Smart Contract)
- Ethereum Sepolia Testnet
- MetaMask Wallet
- Web3.js
- Flask (Python Backend)
- Inter & JetBrains Mono fonts
- SHA-256 Cryptographic Hashing
- Hosted on Vercel

---

## 🔗 Smart Contract

Deployed on Sepolia Testnet.

Contract Address: `0xc16Fc9Ea835930CC4042b85D1c73ED82D3761A88`

Etherscan: https://sepolia.etherscan.io/address/0xc16Fc9Ea835930CC4042b85D1c73ED82D3761A88

---

Made with ❤️ by Dhruv Rajpal
