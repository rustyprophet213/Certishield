// Replace with your real values
const contractAddress = "0xc16Fc9Ea835930CC4042b85D1c73ED82D3761A88";
const abi = [
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "hash",
				"type": "string"
			}
		],
		"name": "addCertificate",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [],
		"name": "admin",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "hash",
				"type": "string"
			}
		],
		"name": "verifyCertificate",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

let web3;
let contract;
let account;

function showLoader(show) {
    document.getElementById("loader").classList.toggle("hidden", !show);
}

async function connectWallet() {
    if (!window.ethereum) return alert("MetaMask required");
    web3 = new Web3(window.ethereum);
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const accounts = await web3.eth.getAccounts();
    account = accounts[0];
    document.getElementById("wallet").innerText = "Connected: " + account;
    contract = new web3.eth.Contract(abi, contractAddress);
}

async function generateHash(file) {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    return Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0')).join('');
}

async function addCertificate() {
    const file = document.getElementById("fileInput").files[0];
    if (!file) return alert("Upload PDF first");

    const hash = await generateHash(file);

    showLoader(true);

    try {
        const tx = await contract.methods
            .addCertificate(hash)
            .send({ from: account });

        showLoader(false);

        // Show transaction details
        const txHash = tx.transactionHash;

        document.getElementById("txHash").innerText =
            "Transaction Hash: " + txHash;

        document.getElementById("etherscanLink").href =
            "https://sepolia.etherscan.io/tx/" + txHash;

        document.getElementById("txSection")
            .classList.remove("hidden");

    } catch (err) {
        showLoader(false);
        alert("Transaction failed.");
        console.error(err);
    }
}

async function verifyCertificate() {
    const file = document.getElementById("verifyFileInput").files[0];
    if (!file) return alert("Upload PDF first");

    const hash = await generateHash(file);

    showLoader(true);
    const result = await contract.methods.verifyCertificate(hash).call();
    showLoader(false);

    document.getElementById("result").innerText =
        result ? "✔ AUTHENTIC CERTIFICATE" : "✖ INVALID CERTIFICATE";
}
