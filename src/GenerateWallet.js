const {ethers} = require('./EthClient');
const file = require('./utils/File');

function generateWallets(numWallets = 10) {
    const wallets = [];

    for (let i = 0; i < numWallets; i++) {
        const wallet = ethers.Wallet.createRandom();

        wallets.push({
            privateKey: wallet.privateKey,
            address: wallet.address
        });
    }

    return wallets;
}

function generateWalletsWriteFileSync(numWallets = 10) {
    const generatedWallets = generateWallets(numWallets);

    console.log(`Generated ${numWallets} wallets:`);
    generatedWallets.forEach(wallet => {
        console.log(`Address: ${wallet.address}`);
        console.log(`Private Key: ${wallet.privateKey}`);
        console.log('-------------------------');
    });

    file.writeFileSync(generatedWallets);
}

module.exports = {
    generateWallets,
    generateWalletsWriteFileSync
}
