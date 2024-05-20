import axios from 'axios';
import dotenv from 'dotenv';
import {ethers} from 'ethers';

import {abi} from '../abi/abi.js';

dotenv.config();

const RPC_URL = process.env.RPC_URL;
const INFURA_MAINNET = process.env.INFURA_MAINNET;
const COIN_GECKO_API_KEY = process.env.COIN_GECKO_API_KEY;
const COIN_GECKO_SIMPLE_PRICE = 'https://api.coingecko.com/api/v3/simple/price';

export const infuraData = async (req, res) => {
  let providerUrl;

  if (req.body.provider === 'infura.io') {
    providerUrl = INFURA_MAINNET;
  }

  if (req.body.provider === 'polygon-rpc.com') {
    providerUrl = RPC_URL;
  }

  if (!providerUrl) {
    res.status(400).send({error: 'Invalid provider'});
    return;
  }

  console.log('providerUrl:', providerUrl);

  const provider = new ethers.providers.JsonRpcProvider(providerUrl);
  try {
    let tokens = req.body.tokens;
    const walletAddress = req.body.walletAddress;

    if (!Array.isArray(tokens)) {
      res.status(400).send({error: 'Tokens must be an array'});
      return;
    }

    if (!walletAddress || walletAddress.length !== 42 || !walletAddress.startsWith('0x')) {
      res.status(400).send({error: 'Invalid wallet address'});
      return;
    }

    const ids = tokens.map((token) => token.id).join(',');

    const prices = await axios.get(COIN_GECKO_SIMPLE_PRICE, {
      headers: {'X-CMC_PRO_API_KEY': COIN_GECKO_API_KEY},
      params: {ids, vs_currencies: 'usd'},
    });

    tokens = tokens.map((token) => {
      const priceData = prices.data[token.id];
      if (priceData) {
        return {...token, price: priceData.usd};
      }
      return token;
    });

    const tokenPromises = tokens.map(async (token) => {
      const contract = new ethers.Contract(token.address, abi, provider);
      const [decimals, balance] = await Promise.all([contract.decimals(), contract.balanceOf(walletAddress)]);
      const balanceInToken = ethers.utils.formatUnits(balance, decimals);
      const balanceInUsd = balanceInToken * token.price;
      return {...token, balanceInToken, balanceInUsd};
    });

    tokens = await Promise.all(tokenPromises);

    tokens.sort((a, b) => b.balanceInUsd - a.balanceInUsd);

    const totalBalanceInUsd = tokens.reduce((total, token) => total + token.balanceInUsd, 0);

    res.send({data: tokens, totalBalanceInUsd});
  } catch (error) {
    console.error(error);
    res.status(500).send({error: 'An error occurred'});
  }
};
