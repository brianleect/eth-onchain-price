
const { Sequelize, Op, Model, DataTypes, QueryTypes } = require("sequelize");
const { RateLimit } = require('async-sema');
const { RATELIMIT_CALL, DB_PATH, PROVIDER, ENABLE_SQL_LOGS } = require('./config');
const { getEthPrice } = require("./utils");
const Web3 = require('web3');
const web3 = new Web3(PROVIDER)

const ratelimitEthCall = new RateLimit(RATELIMIT_CALL, { timeUnit: 1000, uniformDistribution: true });

const sequelize = new Sequelize('database', 'username', null, {
    dialect: 'sqlite',
    storage: DB_PATH,
    logging: ENABLE_SQL_LOGS
})

const ethPrice = sequelize.define('ethPrice', {
    // Model attributes are defined here
    block: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    price: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, { timestamps: false });

// Test connection to DB
(async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
        await sequelize.sync()
        await ethPrice.sync()
        console.log('Eth price synced')
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
})();

async function cacheAllUsdBlocks() {
    console.time('(TIME)(CacheUsd)')
    // Note that we store latest block retrieved at blockNumber -1 for convenience
    var getMaxBlockQuery = await sequelize.query('SELECT MAX(block) FROM ethPrices', { type: QueryTypes.SELECT })
    var lastRetrievedBlock = getMaxBlockQuery[0]['MAX(block)'] ? getMaxBlockQuery[0]['MAX(block)'] : 10100000
    var latestBlock = await web3.eth.getBlockNumber()
    console.log(`(cacheEthUsd) Missing: ${latestBlock - lastRetrievedBlock} / Last: ${lastRetrievedBlock} / Latest: ${latestBlock}`)

    var reserveCalls = []
    var latestSavedBlock = lastRetrievedBlock
    for (let i = lastRetrievedBlock + 1; i < latestBlock; i++) {
        await ratelimitEthCall()
        const reserveCall = getEthPrice(i)

        // TODO: Check if will cause overflow? Maybe there's a better way to track completion without 
        // Could we simply do while (latestSavedBlock!=latestBlock) ? 
        reserveCalls.push(reserveCall) // Store in promises array

        // Reserve call follow up
        reserveCall.then(res => {
            ethPrice.create({ block: res.blk, price: res.usd })
            if (res.blk % 1000 == 0)
                console.log(`Remaining: ${latestBlock - res.blk} / Blk ${res.blk}/${latestBlock} retrieved / $${res.usd}`)

            if (res.blk > latestSavedBlock) latestSavedBlock = res.blk
        })
    }

    await Promise.allSettled(reserveCalls)
    console.log('(cacheEthUsd) Last saved:', latestSavedBlock)
    console.timeEnd('(TIME)(CacheUsd)')

    // Recursively call set time out every 10s
    setTimeout(cacheAllUsdBlocks, 10000)
}

setTimeout(cacheAllUsdBlocks, 100)