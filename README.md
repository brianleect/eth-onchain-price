# eth-onchain-price

## Objective
Access to historical price of ETH completely on-chain stored in a SQLite DB that can be queried for convenience.

## Installation
1. ``git clone https://github.com/brianleect/eth-onchain-price``
2. ``npm install package.json``
3. Update config.js with relevant params (WS Provider, rate limit, location to store DB)
4. ``node index.js``

## Usage / Elaborations
1. First run retrieving from ~2017 will take longer.
2. After first run, simply leave the process running for it and it'll continuously retrieve price onchain for ETH on a per block basis.
3. If process is stopped, it'll continue where it previously left off.

