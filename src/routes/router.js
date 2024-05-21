import express from 'express';

import {swap} from '../controllers/swap.js';
import {tokenData} from '../controllers/tokenData.js';
import {sendMatic} from '../controllers/sendMatic.js';
import {sendToken} from '../controllers/sendToken.js';
// import {infuraData} from '../controllers/InfuraData.js';
import {estimateFee} from '../controllers/estimateFee.js';
import {createWallet} from '../controllers/createWallet.js';
import {restoreWallet} from '../controllers/restoreWallet.js';
import {getTransactions} from '../controllers/getTransactions.js';

export const router = express.Router();

router.post('/swap', swap);
router.post('/sendToken', sendToken);
router.post('/sendMatic', sendMatic);
// router.post('/infuraData', infuraData);
router.post('/estimateFee', estimateFee);
router.get('/createWallet', createWallet);
router.post('/restoreWallet', restoreWallet);
router.post('/getTransactions', getTransactions);
