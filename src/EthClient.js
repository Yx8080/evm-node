require('dotenv').config();
const { ethers } = require('ethers');
const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
let mainWallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

function toHex(string) {
    return '0x' + Buffer.from(string, 'utf8').toString('hex');
  }

module.exports = {
    ethers,
    provider,
    mainWallet,
    toHex
};