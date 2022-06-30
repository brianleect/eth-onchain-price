# eth-onchain-price

## Objective
Access to historical price of ETH completely on-chain stored in a SQLite DB that can be queried for convenience.

## Installation
1. ``git clone https://github.com/brianleect/eth-onchain-price``
2. ``npm install package.json``
3. Update ``sample.config.js`` with relevant fields ``provider`` , ``DB_PATH`` ..
4. Rename ``sample.config.js`` to ``config.js``
5. ``node index.js``

## Elaboration on quirks
1. Start block for default initialization is ``10100000``
2. Ideally running on a local node we can set rate limit to 500-600 which should be significantly faster.
3. Alternatively, download recently synced DB and continue from there. Alchemy limit of 10/s should be more than sufficient to keep up.
