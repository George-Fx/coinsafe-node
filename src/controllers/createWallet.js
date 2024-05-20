import {ethers} from 'ethers';
import * as bip39 from 'bip39';

export const createWallet = async (req, res) => {
  try {
    const wordCount = req.query.wordCount; // Получаем количество слов из запроса
    let entropy;
    switch (wordCount) {
      case '12':
        entropy = 128;
        break;
      case '15':
        entropy = 160;
        break;
      case '18':
        entropy = 192;
        break;
      case '21':
        entropy = 224;
        break;
      case '24':
        entropy = 256;
        break;
      default:
        return res
          .status(400)
          .send('Invalid word count. It must be one of the following: 12, 15, 18, 21, 24');
    }

    const mnemonicPhrase = bip39.generateMnemonic(entropy);
    const wallet = ethers.Wallet.fromMnemonic(mnemonicPhrase);
    const walletAddress = wallet.address;
    const privateKey = wallet.privateKey;

    res.send({walletAddress, privateKey, mnemonicPhrase});
  } catch (err) {
    console.error('Error:', err);
    res.status(500).send('An error occurred while creating the wallet');
  }
};

// import {ethers} from 'ethers';

// export const createWallet = async (req, res) => {
//   try {
//     const wallet = ethers.Wallet.createRandom();
//     const walletAddress = wallet.address;
//     const privateKey = wallet.privateKey;
//     const mnemonicPhrase = wallet.mnemonic.phrase;

//     res.send({walletAddress, privateKey, mnemonicPhrase});
//   } catch (err) {
//     console.error('Error:', err);
//     res.status(500).send('An error occurred while creating the wallet');
//   }
// };
