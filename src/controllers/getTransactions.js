import axios from 'axios';
import dotenv from 'dotenv';
import Web3 from 'web3';
import InputDataDecoder from 'ethereum-input-data-decoder';
import {abi} from '../abi/abi.js';
const decoder = new InputDataDecoder(abi); // Путь к ABI контракта ERC20

dotenv.config();

export const getTransactions = async (req, res) => {
  console.log('getTransactions', req.body.walletAddress);
  try {
    if (!req.body.walletAddress) {
      res.status(400).send({error: 'Invalid wallet address'});
      return;
    }

    if (req.body.walletAddress.length !== 42) {
      res.status(400).send({error: 'Invalid wallet address'});
      return;
    }

    if (!req.body.walletAddress.startsWith('0x')) {
      res.status(400).send({error: 'Invalid wallet address'});
      return;
    }

    const walletAddress = req.body.walletAddress;
    const POLYGONSCAN_API_KEY = process.env.POLYGONSCAN_API_KEY;
    // const url = `https://api.polygonscan.com/api?module=account&action=txlist&address=${walletAddress}&startblock=0&endblock=99999999&sort=asc&apikey=${POLYGONSCAN_API_KEY}`;
    // const url = `https://api.polygonscan.com/api?module=account&action=tokentx&address=${walletAddress}&startblock=0&endblock=99999999&sort=asc&apikey=${POLYGONSCAN_API_KEY}`;
    const url = `https://api.polygonscan.com/api?module=account&action=tokentx&address=${walletAddress}&startblock=0&endblock=99999999&sort=asc&apikey=${POLYGONSCAN_API_KEY}`;
    const response = await axios.get(url);
    const transactions = response.data.result;

    const myTransactions = transactions
      .filter((tx) => tx.from.toLowerCase() === walletAddress.toLowerCase())
      .map((tx) => {
        const decodedInput = decoder.decodeData(tx.input);
        if (decodedInput.method === 'transfer') {
          const tokensInWei = decodedInput.inputs[1].toString(10);
          tx.transferredTokens = Web3.utils.fromWei(tokensInWei, 'ether'); // Преобразование из wei в ether
        }
        return tx;
      });

    res.send({data: myTransactions});
    // const transactions = await axios.get(url);

    // console.log(myTransactions);
    // const transactions = response.data.result;
    // res.send({data: transactions});
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('Unknown error');
    }
  }
};
