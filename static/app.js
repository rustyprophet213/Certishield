const contractAddress = "0x9B3078080Cec7aF658a4771A191BBeF0139FB563";
const abi = [
    {
        "inputs": [{ "internalType": "string", "name": "hash", "type": "string" }],
        "name": "addCertificate",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "string", "name": "hash", "type": "string" }],
        "name": "verifyCertificate",
        "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
        "stateMutability": "view",
        "type": "function"
    }
];

let web3;
let contract;
let account;
let currentTxHash = "";

/* ── Toast ── */
function showToast(message, type = "info", duration = 4000) {
    const container = document.getElementById("toastContainer");
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<span class="toast-dot"></span>${message}`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = "toastOut 0.25s ease forwards";
        setTimeout(() => toast.remove(), 260);
    }, duration);
}

/* ── Loader ── */
function showLoader(show, text = "Processing transaction...") {
    const overlay = document.getElementById("loaderOverlay");
    document.getElementById("loaderText").textContent = text;
    overlay.classList.toggle("hidden", !show);
}

/* ── Wallet ── */
async function connectWallet() {
    if (!window.ethereum) {
        showToast("MetaMask not detected. Please install the extension.", "error");
        return;
    }
    try {
        web3 = new Web3(window.ethereum);
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const accounts = await web3.eth.getAccounts();
        account = accounts[0];

        document.getElementById("wallet").textContent = account;
        document.getElementById("wallet").classList.remove("hidden");

        const shortAddr = account.slice(0, 6) + "..." + account.slice(-4);
        document.getElementById("walletAddressShort").textContent = shortAddr;
        document.getElementById("walletStatus").classList.remove("hidden");

        document.getElementById("connectBtn").textContent = "Wallet Connected";
        document.getElementById("connectBtn").disabled = true;
        document.getElementById("connectBtn").style.opacity = "0.6";

        contract = new web3.eth.Contract(abi, contractAddress);
        showToast("Wallet connected successfully.", "success");
    } catch (err) {
        showToast("Wallet connection rejected.", "error");
        console.error(err);
    }
}

/* ── Hash ── */
async function generateHash(file) {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    return Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, "0")).join("");
}

/* ── Register ── */
async function addCertificate() {
    if (!account) { showToast("Please connect your wallet first.", "error"); return; }
    const file = document.getElementById("fileInput").files[0];
    if (!file) { showToast("Please select a PDF certificate to register.", "error"); return; }

    showLoader(true, "Hashing certificate & sending transaction...");
    try {
        const hash = await generateHash(file);

        // Fixed safe gas limit for a simple mapping write (~50k actual cost)
        const tx = await contract.methods.addCertificate(hash).send({ from: account, gas: 80000 });

        showLoader(false);
        currentTxHash = tx.transactionHash;

        document.getElementById("txHash").textContent = currentTxHash;
        document.getElementById("etherscanLink").href =
            "https://sepolia.etherscan.io/tx/" + currentTxHash;
        document.getElementById("txSection").classList.remove("hidden");

        showToast("Certificate registered on the blockchain!", "success", 6000);
    } catch (err) {
        showLoader(false);
        showToast("Transaction failed or was rejected.", "error");
        console.error(err);
    }
}

/* ── Verify ── */
async function verifyCertificate() {
    if (!account) { showToast("Please connect your wallet first.", "error"); return; }
    const file = document.getElementById("verifyFileInput").files[0];
    if (!file) { showToast("Please select a PDF certificate to verify.", "error"); return; }

    showLoader(true, "Verifying certificate on blockchain...");
    try {
        const hash = await generateHash(file);
        const isValid = await contract.methods.verifyCertificate(hash).call();
        showLoader(false);

        const resultBox  = document.getElementById("resultBox");
        const resultText = document.getElementById("result");
        const resultSub  = document.getElementById("resultSub");
        const resultIcon = document.getElementById("resultIcon");

        resultBox.classList.remove("hidden", "authentic", "invalid");

        if (isValid) {
            resultBox.classList.add("authentic");
            resultIcon.textContent = "✅";
            resultText.textContent = "Authentic Certificate";
            resultSub.textContent  = "This certificate hash is verified on-chain.";
            showToast("Certificate verified as authentic.", "success");
        } else {
            resultBox.classList.add("invalid");
            resultIcon.textContent = "❌";
            resultText.textContent = "Invalid Certificate";
            resultSub.textContent  = "No matching record found on the blockchain.";
            showToast("Certificate could not be verified.", "error");
        }
    } catch (err) {
        showLoader(false);
        showToast("Verification failed. Check console for details.", "error");
        console.error(err);
    }
}

/* ── Copy TX Hash ── */
function copyTxHash() {
    if (!currentTxHash) return;
    navigator.clipboard.writeText(currentTxHash).then(() => {
        showToast("Transaction hash copied to clipboard.", "info");
    });
}

/* ── Drag & Drop ── */
function setupDropzone(dropzoneId, inputId, fileDisplayId) {
    const zone  = document.getElementById(dropzoneId);
    const input = document.getElementById(inputId);
    const display = document.getElementById(fileDisplayId);

    if (!zone || !input) return;

    zone.addEventListener("dragover", (e) => {
        e.preventDefault();
        zone.classList.add("dragover");
    });

    zone.addEventListener("dragleave", () => zone.classList.remove("dragover"));

    zone.addEventListener("drop", (e) => {
        e.preventDefault();
        zone.classList.remove("dragover");
        const files = e.dataTransfer.files;
        if (files.length > 0 && files[0].type === "application/pdf") {
            const dt = new DataTransfer();
            dt.items.add(files[0]);
            input.files = dt.files;
            showFileDisplay(display, files[0].name);
        } else {
            showToast("Only PDF files are accepted.", "error");
        }
    });

    input.addEventListener("change", () => {
        if (input.files.length > 0) {
            showFileDisplay(display, input.files[0].name);
        }
    });
}

function showFileDisplay(el, name) {
    el.textContent = name;
    el.classList.remove("hidden");
}

/* ── Init ── */
document.addEventListener("DOMContentLoaded", () => {
    setupDropzone("registerDropzone", "fileInput", "registerFileName");
    setupDropzone("verifyDropzone",   "verifyFileInput", "verifyFileName");
});
