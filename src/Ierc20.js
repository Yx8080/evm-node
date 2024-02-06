require('dotenv').config();
const { generateNonce } = require('./GenerateNonce')
const { mainWallet,toHex } = require('./EthClient')
const { bnUtils } = require('./utils/bn')
const { ethers }  = require('ethers')
const Spinnies = require('spinnies');


const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

/**
 * ierc-20 mint
 * @param {number} tick 
 * @param {number} amt 
 * @param {number} count 
 */
async function batchMintIERC20(tick, amt = 1000, count = 1000) {
    let success = 0;
    let fail = 0;
    let nonce = await mainWallet.getTransactionCount();
    let list = []
    for (let j = 0; j < count; j++) {
        let data = `data:application/json,{"p":"ierc-20","op":"mint","tick":"${tick}","amt":"${amt}","nonce":"${generateNonce()}"}`
        try {
            const tx = {
                to: ZERO_ADDRESS,
                value: ethers.utils.parseEther('0'),
                data: toHex(data),
                nonce: nonce++
            };
            let txResponse = await mainWallet.sendTransaction(tx);
            console.log(`ierc-20 success hash:${txResponse.hash}`);
            list.push(txResponse);
        } catch (error) {
            fail++;
            console.log(`inscribe fial :${error}`);
        }
    }
    await Promise.all(list);
    console.log(`inscribe complete; success:${success} fail ${fail}`);
}

let unique = 0;

/**
 * ierc-20 pow mine
 * @param {string} tick 
 * @param {number} amt 
 * @param {string} workc 
 * @returns 
 */
async function runMine(tick,amt,workc) {
    console.log(`
   
    ██ ████████ ███████     ██████   ████   ████    █   ██    ██
    ░██░██░░░░░ ░██░░░░██   ██░░░░██ █░░░ █ █░░░██  ░█  ░░██  ██ 
    ░██░██      ░██   ░██  ██    ░░ ░    ░█░█  █░█  ░█   ░░████  
    ░██░███████ ░███████  ░██          ███ ░█ █ ░█  ░     ░░██   
    ░██░██░░░░  ░██░░░██  ░██         █░░  ░██  ░█   █     ░██   
    ░██░██      ░██  ░░██ ░░██    ██ █     ░█   ░█  ░█     ░██   
    ░██░████████░██   ░░██ ░░██████ ░██████░ ████   ░█     ░██   
    ░░ ░░░░░░░░ ░░     ░░   ░░░░░░  ░░░░░░  ░░░░    ░      ░░    
    
    
    `)
    printer.trace(`Start mining with ${address}`);

    const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
    const miner = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    const network = await provider.getNetwork();
    printer.trace(`network is ${network.name} (chainID: ${network.chainId})`);

    const currentGasPrice = await provider.getGasPrice();
    const targetGasFee = currentGasPrice.div(100).mul(GAS_PREMIUM);

    printer.trace(`Current gas price usage ${bnUtils.fromWei(targetGasFee.toString(), 9)} gwei`);
    const nonce = await getNonce();
    printer.trace(`nonce is ${nonce}`);
    const balance = await miner.getBalance();
    printer.trace(`balance is ${bnUtils.fromWei(balance.toString(), 18).dp(4).toString()}`);

    const spinnies = new Spinnies();
    printer.trace(`The current mining difficulty is ${workc}`);
    printer.trace(`Expected to take 1-2 minutes to calculate...`);
    spinnies.add("mining", { text: "start mining...", color: "blue" });

    await sleep(1000);

    let timer = Date.now(),
        startTimer = timer,
        mineCount = 0;

    while (true) {
        mineCount += 1;
        const callData = `data:application/json,{"p":"ierc-20","op":"mint","tick":"${tick}","amt":"${amt}","nonce":"${generateNonce()}${unique++}"}`;
        const transaction = {
            type: 2,
            chainId: network.chainId,
            to: ZERO_ADDRESS,
            maxPriorityFeePerGas: targetGasFee,
            maxFeePerGas: targetGasFee,
            gasLimit: ethers.BigNumber.from("25000"),
            nonce: nonce,
            value: ethers.utils.parseEther("0"),
            data: toHex(callData),
        };
        const rawTransaction =  ethers.utils.serializeTransaction(transaction);
        const transactionHash = ethers.utils.keccak256(rawTransaction);

        const signingKey = miner._signingKey();
        const signature = signingKey.signDigest(transactionHash);

        const recreatedSignature = ethers.utils.joinSignature(signature);

        const predictedTransactionHash = ethers.utils.keccak256(
            ethers.utils.serializeTransaction(transaction, recreatedSignature)
        );

        const now = Date.now();
        if (now - timer > 100) {
            await sleep(1);
            spinnies.update("mining", {
                text: `[${dayjs(now).format(
                    "YYYY-MM-DD HH:mm:ss"
                )}] ${mineCount} - ${predictedTransactionHash}`,
                color: "red",
            });
            timer = now;
        }

        if (predictedTransactionHash.includes(workc)) {
            unique = 0;
            spinnies.succeed("mining", {
                text: `${mineCount} - ${predictedTransactionHash}`,
                color: "green",
            });
            const mineTime = (Date.now() - startTimer) / 1000;
            printer.info(
                `Total time spent ${mineTime}s, average arithmetic ${Math.ceil(mineCount / mineTime)} c/s`
            );
            const realTransaction = await miner.sendTransaction(transaction);
            printer.info(`mining hash: ${realTransaction.hash}`);
            await realTransaction.wait();

            return printer.info("mining success");
        }
    }
};

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
    batchMintIERC20,runMine
}