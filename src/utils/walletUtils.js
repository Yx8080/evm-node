const { ethers,mainWallet } = require('../EthClient')
const file = require('./File')

/**
 * get wallet balance
 * @param {string} unit 
 * @returns {any} list wallet
 */
async function getBalanceReadFile(unit = "ETH", filePath = 'wallets.json') {
    const generatedWallets = await file.readWalletsFromFile(filePath);
    return await getBalance(generatedWallets, unit);
}

/**
 * get balance
 * @param {any} generatedWallets 
 * @param {string} unit 
 * @returns {any}
 */
async function getBalance(generatedWallets, unit = "ETH") {
    const list = []
    for (let i = 0; i < generatedWallets.length; i++) {
        const walletInfo = generatedWallets[i];
        const wallet = new ethers.Wallet(walletInfo.privateKey, provider);
        const balance = (await wallet.getBalance()).toString();
        const max_transfer_balance = parseFloat(ethers.utils.formatEther(balance)).toFixed(3);
        const wallet_json = {}
        wallet_json.address = wallet.address;
        wallet_json.max_transfer_balance = max_transfer_balance;
        list.push(wallet_json);
        console.error(`addr: ${wallet.address},balance:${max_transfer_balance} ${unit}`);
    }
    return list;
}

/**
 * balance Gather
 * @param filePath
 */
async function balanceGatherReadFile(filePath = 'wallets.json') {
    const wallets = await file.readWalletsFromFile(filePath);
    await balanceGather(wallets);
}

/**
 * batch transfer -> main address
 * @param {any} wallets 
 */
async function balanceGather(wallets) {
    const list = []
    let mainAddr =process.env.COLLECT_ADDR;
    if(mainAddr || mainAddr.trim() === ''){
        mainAddr = mainWallet.address;
    }
    for (let i = 0; i < wallets.length; i++) {
        const wallet = new ethers.Wallet(wallets[i].privateKey, provider);
        const balance = await wallet.getBalance();
        const balance_big = new BigNumber(ethers.utils.formatEther(balance));
        const sender_balance = balance_big.toFixed(4, BigNumber.ROUND_DOWN);
        if (balance_big.comparedTo(new BigNumber('0.0001')) === -1) {
            continue;
        }
        const gas = await wallet.estimateGas({
            to: mainAddr,
            value: ethers.utils.parseEther(sender_balance.toString())
        })

        const tx = {
            to: mainAddr,
            value: ethers.utils.parseEther(sender_balance.toString()),
            gasPrice: gas,
        };
        const txResponse = await wallet.sendTransaction(tx);
        console.log(`address:${wallet.address},max_transfer_balance:${sender_balance},hash:${txResponse.hash}`);
        list.push(txResponse);
    }
    await Promise.all(list)
    console.log("Done");
}

async function batchTransferReadFile(value) {
    const generatedWallets = await file.readWalletsFromFile()
    await batchTransfer(generatedWallets,value);
}

/**
 * main batch transfer -> wallets
 * @param {any} generatedWallets 
 * @param {string} value 
 */
async function batchTransfer(generatedWallets,value) {
    let mainWalletNonce = await mainWallet.getTransactionCount();

    for (let i = 0; i < generatedWallets.length; i++) {
        const walletInfo = generatedWallets[i];
        const toAddress = walletInfo.address;
        try {
            const tx = {
                to: toAddress,
                value: ethers.utils.parseEther(value),
                nonce: mainWalletNonce++,
            };
            const txResponse = await mainWallet.sendTransaction(tx);
            console.log(`Transfer successful to ${toAddress}. Transaction Hash: ${txResponse.hash}`);
        } catch (error) {
            console.error(`Error transferring to ${toAddress}: ${error.message}`);
        }
    }
}