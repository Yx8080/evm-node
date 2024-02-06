// Import sha256 function from './sha256'
const { sha256 } = require('./sha256');
const axios = require('axios');


// Define EthscriptionsAPI class
class EthscriptionsAPI {
  // Constructor with a default baseUrl
  constructor(baseUrl = 'https://ethscriber.xyz') {
    this.baseUrl = baseUrl;
  }

  async checkAvailability(dataUri) {
    const hash = await sha256(dataUri);

    const response = await axios.get(`${this.baseUrl}/api/ethscriptions/exists/${hash}`);

    const data = await response.data;

    return {
      isTaken: data.result,
      ownerAddress: data.ethscription?.current_owner || null,
    };
  }
}

// Export the EthscriptionsAPI class
module.exports = { EthscriptionsAPI };