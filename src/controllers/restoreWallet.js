import {ethers} from 'ethers';

export const restoreWallet = async (req, res) => {
  console.log('restoreWallet controller');
  try {
    const mnemonic = req.body.mnemonic;
    const wallet = ethers.Wallet.fromMnemonic(mnemonic);

    console.log('mnemonic:', mnemonic);

    const walletAddress = wallet.address;
    const privateKey = wallet.privateKey;
    const mnemonicPhrase = wallet.mnemonic.phrase;

    res.send({walletAddress, privateKey, mnemonicPhrase});
  } catch (err) {
    console.error('Error:', err);
    res.status(500).send('An error occurred while restoring the wallet');
  }
};
