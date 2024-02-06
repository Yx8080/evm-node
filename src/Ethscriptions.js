const { EthscriptionsAPI } = require('./utils/EthscriptionsAPI');
const { sha256 } = require('./utils/sha256')
const {  ethers,mainWallet,toHex } = require('./EthClient');

/**
 * erc-20 inscribe,Automatic duplication checking。
 * @param {string} tick tick
 * @param {number} amt amt,default value 1000
 * @param {number} count inscribe number
 * @param {number} startIndex start index,default value 1
 * @param {number} endIndex end index,default value 21000
 */
async function batchMintEthscriptions(tick, amt = 1000, count = 1000, startIndex = 1, endIndex = 21000) {
    let success = 0;
    let fail = 0;
    let ethscriptionsAPI = new EthscriptionsAPI();
    let repeatIndexs = new Set();
    let nonce = await mainWallet.getTransactionCount();
    const list = []
    for (let j = 0; j < count; j++) {
        let indexId = generateRandomNumbers(startIndex, endIndex);
        if (repeatIndexs.has(indexId)) {
            continue;
        }
        let data = `data:,{"p":"erc-20","op":"mint","tick":"${tick}","id":"${indexId}","amt":"${amt}"}`
        // console.log(data);
        let response = await ethscriptionsAPI.checkAvailability(await sha256(data));
        if (response.isTaken) {
            repeatIndexs.add(id);
            continue;
        }
        try {
            const tx = {
                to: address,
                value: ethers.utils.parseEther('0'),
                data: toHex(data),
                nonce: nonce++
            };
            let txResponse = await mainWallet.sendTransaction(tx);
            console.log(`erc-20 success hash:${txResponse.hash}`);
            list.push(txResponse);
        } catch (error) {
            fail++;
            console.log(`inscribe fial :${error}`);
        }
    }
    await Promise.all(list);
    console.log(`inscribe complete; success:${success} fail ${fail}`);
}

function generateRandomNumbers(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = {
    batchMintEthscriptions
}