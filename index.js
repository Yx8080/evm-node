const file = require("./src/utils/File")

async function main(){
    const wallet = await file.readWalletsFromFile();
    console.log(wallet)
}

main();