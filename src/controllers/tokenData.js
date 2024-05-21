import axios from 'axios';
import dotenv from 'dotenv';
import {ethers} from 'ethers';

import {abi} from '../abi/abi.js';

dotenv.config();

const RPC_URL = process.env.RPC_URL;
const INFURA_MAINNET = process.env.INFURA_MAINNET;
const COIN_GECKO_API_KEY = process.env.COIN_GECKO_API_KEY;
const COIN_GECKO_SIMPLE_PRICE = 'https://api.coingecko.com/api/v3/simple/price';

export const tokenData = async (req, res) => {
  console.log('this is test');
};
