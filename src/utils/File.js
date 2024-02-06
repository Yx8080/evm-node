const fs = require('fs');

/**
 * Read and load wallet file
 * @returns {@type any} wallet list
 */
async function readWalletsFromFile(filePath = 'wallets.json') {
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch (error) {
        console.error(`Error reading wallets from file: ${error.message}`);
        return [];
    }
}

/**
 * 
 * @param {any} generatedWallets wallet list 
 * @param {string} filePath wallet address
 * @param {number} space indent
 */
async function writeFileSync(generatedWallets,filePath=`wallets.json`,space = 2){
    fs.writeFileSync(filePath , JSON.stringify(generatedWallets, null, space));
}

module.exports = {
    readWalletsFromFile,
    writeFileSync
}

