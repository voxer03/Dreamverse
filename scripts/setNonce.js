const main = async () => {
    await network.provider.send("hardhat_setNonce", [
        "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "0x40",
      ]);
    console.log('Nonce changed');
}

main()
.then( () => process.exit(0))
.catch( err => {
    console.log(err);
})