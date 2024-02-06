let lastNonce = 0;
let lastTimestamp = Date.now();
function generateNonce() {
  const currentTimestamp = Date.now();
  if (currentTimestamp !== lastTimestamp) {
    lastNonce = 0;
    lastTimestamp = currentTimestamp;
  }
  return `${currentTimestamp}${lastNonce++}`;
}

module.exports = { generateNonce };