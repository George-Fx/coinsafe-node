import dotenv from 'dotenv';
import Web3 from 'web3';

dotenv.config();

const RPC_URL = process.env.RPC_URL;
const POLYGON_MAINNET = process.env.POLYGON_MAINNET;

export const sendMatic = async (req, res) => {
  let providerUrl;

  if (req.body.provider === 'infura.io') {
    providerUrl = POLYGON_MAINNET;
  }

  if (req.body.provider === 'polygon-rpc.com') {
    providerUrl = RPC_URL;
  }

  if (!providerUrl) {
    res
      .status(400)
      .send({error: 'Invalid provider', message: 'Invalid provider'});
    return;
  }

  const {amount, privateKey, recipient} = req.body;

  try {
    const web3 = new Web3(new Web3.providers.HttpProvider(providerUrl));

    const MIN_GAS_PRICE = web3.utils.toWei('1', 'gwei');
    const MAX_GAS_PRICE = web3.utils.toWei('100', 'gwei');

    const gasPrice = await web3.eth.getGasPrice();
    let adjustedGasPrice = Math.round(gasPrice * 1.5);

    const amountInMatic = amount;
    const amountInWei = web3.utils.toWei(amountInMatic.toString(), 'ether');

    const rootAccount = web3.eth.accounts.privateKeyToAccount(privateKey);

    web3.eth.accounts.wallet.add(rootAccount);
    web3.eth.defaultAccount = rootAccount.address;

    const transactionObject = {
      from: rootAccount.address,
      to: recipient,
      value: amountInWei,
    };

    transactionObject.gas = await web3.eth.estimateGas(transactionObject);
    // Если регулированная цена газа ниже минимальной, установите ее на минимальную
    if (web3.utils.toBN(adjustedGasPrice).lt(web3.utils.toBN(MIN_GAS_PRICE))) {
      adjustedGasPrice = MIN_GAS_PRICE;
    }

    // Если регулированная цена газа выше максимальной, установите ее на максимальную
    if (web3.utils.toBN(adjustedGasPrice).gt(web3.utils.toBN(MAX_GAS_PRICE))) {
      adjustedGasPrice = MAX_GAS_PRICE;
    }

    transactionObject.gasPrice = adjustedGasPrice;

    const signedTransaction = await web3.eth.accounts.signTransaction(
      transactionObject,
      privateKey,
    );

    const transactionReceipt = await web3.eth.sendSignedTransaction(
      signedTransaction.rawTransaction,
    );

    if (transactionReceipt.status) {
      console.log(
        'Transaction was successful',
        transactionReceipt.transactionHash,
      );
      res
        .status(200)
        .send({message: 'Transaction was successful', transactionReceipt});
    }

    if (!transactionReceipt.status) {
      console.log('Transaction failed', transactionReceipt);
      res.status(400).send({error: 'Transaction failed', transactionReceipt});
    }
  } catch (error) {
    console.error('error sending the transaction', error);
    res.status(500).send({error: error.message});
  }
};
