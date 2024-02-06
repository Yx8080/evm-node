const crypto = require('crypto');

/**
 * Encode data into sha256 hash
 * Equivalent to:
 *  ethers.utils.sha256(ethers.utils.toUtf8Bytes(mst))
 * Difference: extra 0x
 * @param {string} message 
 * @returns 
 */
async function sha256(message) {
    // encode as UTF-8
    const msgBuffer = new TextEncoder().encode(message);
  
    // hash the message
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  
    // convert ArrayBuffer to Array
    const hashArray = Array.from(new Uint8Array(hashBuffer));
  
    // convert bytes to hex string
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    return hashHex;
}

module.exports = { sha256 };