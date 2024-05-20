import {ethers} from 'ethers';
import dotenv from 'dotenv';

import {Token, CurrencyAmount, Percent} from '@uniswap/sdk-core';
import {Pair, Route, Trade, tradeComparator} from '@uniswap/v2-sdk';

dotenv.config();

import {uniswapAbi} from '../abi/uniswapABI.js';
import {uniswapV2poolABI} from '../abi/uniswapV2poolABI.js';

const INFURA_MAINNET = process.env.INFURA_MAINNET;
const RPC_URL = process.env.RPC_URL;

export const swap = async (req, res) => {
  try {
    const privateKey = req.body.privateKey;

    // slippageTolerance - это параметр, который используется в торговле
    // криптовалютами для учета возможного изменения цены в процессе выполнения сделки.
    const slippageTolerance = new Percent('50', '10000');

    // Создание провайдера и подписчика
    const provider = new ethers.providers.JsonRpcProvider(INFURA_MAINNET);

    // Создание объекта подписчика
    const signer = new ethers.Wallet(privateKey, provider);

    const routerAddress = '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff';

    // Адреса токенов
    const token0Address = ethers.utils.getAddress('0x53e0bca35ec356bd5dddfebbd1fc0fd03fabad39');
    const token1Address = '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063';

    console.log('Token0 address:', token0Address);

    const token0 = new Token(137, token0Address, 18, 'LINK', 'Chainlink');
    const token1 = new Token(137, token1Address, 18, 'DAI', 'Dai Stablecoin');

    // Создание объекта пары
    const pairAddress = Pair.getAddress(token0, token1);

    // Создание объекта контракта пары
    const pairContract = new ethers.Contract(pairAddress, uniswapV2poolABI, provider);

    // Шаг 1: Получить резервы пары
    const reserves = await pairContract['getReserves']();
    const [reserve0, reserve1] = reserves;

    // Шаг 2: Создать объект пары
    const pair = new Pair(
      CurrencyAmount.fromRawAmount(token0, reserve0),
      CurrencyAmount.fromRawAmount(token1, reserve1),
    );

    // Шаг 3: Создать маршрут
    const route = new Route([pair], token0, token1);

    // Шаг 5: Рассчитать минимальное количество токенов
    // const slippageTolerance = new Percent('50', '10000'); // 50 bips, or 0.50%
    // const amountOutMin = trade.minimumAmountOut(slippageTolerance).toExact();

    // const HOT = new Token(137, '
    // 0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39', 18, 'HOT', 'Holo');
    // const NOT = new Token(137, '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063', 18, 'NOT', 'Not');

    // const pairAddress = Pair.getAddress(HOT, NOT);
    // const HOT_NOT = new Pair(
    //   CurrencyAmount.fromRawAmount(HOT, '2000000000000000000'),
    //   CurrencyAmount.fromRawAmount(NOT, '1000000000000000000'),
    // );

    // const route = new Route([pair], token0, token1);

    // const tokens = [DAI, LINK];
    // // const [token0, token1] = tokens[0].sortsBefore(tokens[1]) ? tokens : [tokens[1], tokens[0]];

    // // Теперь вы можете безопасно создать маршрут
    //
    // // const test = route.

    // const trade = new Trade(
    //   route,
    //   CurrencyAmount.fromRawAmount(WETH9[DAI.chainId], amountIn),
    //   TradeType.EXACT_INPUT,
    // );

    // const slippageTolerance = new Percent('50', '10000'); // 50 bips, or 0.50%

    const router = new ethers.Contract(routerAddress, uniswapAbi, signer);

    const amountIn = '1000000000000000000'; // 1 WETH

    // Создание объекта торговли с маршрутом и входным токеном
    // Trade - это объект, который представляет собой обмен между двумя токенами
    const trade = new Trade(route, CurrencyAmount.fromRawAmount(token0, amountIn), tradeComparator);

    // Параметры функции обмена
    // const amountIn = ethers.utils.parseUnits('0.01', 18); // 1.0 входной токен
    const amountOutMin = trade.minimumAmountOut(slippageTolerance).toExact();
    const path = [token0Address, token1Address]; // путь от token0 к token1
    const to = '0x45C061F2004b65357E0Ba48e4d84D1b5E461ECdE'; // ваш адрес
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 минут с текущего времени

    // Вызов функции обмена
    const tx = await router.swapExactTokensForTokens(amountIn, amountOutMin, path, to, deadline);
    console.log(`Transaction hash: ${tx.hash}`);

    // Ожидание майнинга транзакции
    const receipt = await tx.wait();
    console.log(`Transaction was mined in block ${receipt.blockNumber}`);
  } catch (error) {
    console.log(error);
  }
};
