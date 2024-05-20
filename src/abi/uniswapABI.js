export const uniswapAbi = [
  {
    constant: false,
    inputs: [
      {
        name: 'amountIn',
        type: 'uint256',
      },
      {
        name: 'amountOutMin',
        type: 'uint256',
      },
      {
        name: 'path',
        type: 'address[]',
      },
      {
        name: 'to',
        type: 'address',
      },
      {
        name: 'deadline',
        type: 'uint256',
      },
    ],
    name: 'swapExactTokensForTokens',
    outputs: [
      {
        name: 'amounts',
        type: 'uint256[]',
      },
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
];
