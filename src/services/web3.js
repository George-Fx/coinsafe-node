import {Web3} from 'web3';
import {config} from 'dotenv';

config();

export const web3 = new Web3(
  'https://polygon-mainnet.infura.io/v3/4ff14356c8034102bf3a5730fbe79159',
);
