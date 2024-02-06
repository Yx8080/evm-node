const { ethers,mainWallet,toHex } = require('./EthClient')

/**
  * evm Inscribe
  * @param {string} data utf-8
  * @param {number} count
  * @param {address} address
  * @param {string} value
  * @returns {string} 
  */
async function batchInscribe(data, count, address = mainWallet.address, value = '0') {
    let success = 0;
    let fail = 0;
    let nonce = await mainWallet.getTransactionCount();
    const list = []
    for (let index = 0; index < count; index++) {
        try {
            const tx = {
                to: address,
                value: ethers.utils.parseEther(value),
                data: toHex(data),
                nonce: nonce++
            };
            const txResponse = await mainWallet.sendTransaction(tx);
            success++;
            console.log(`inscribe success nonce: ${success} hash:${txResponse.hash}`);
            list.push(txResponse);
        } catch (error) {
            fail++;
            console.log(`inscribe fial nonce: ${fail} ${error}`);
        }
    }
    await Promise.all(list);
    console.log(`inscribe complete; success:${success} fail ${fail}`);
}

module.exports = {
    batchInscribe
}