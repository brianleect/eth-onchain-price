
const { Sequelize, Op, Model, DataTypes } = require("sequelize");
const { RateLimit } = require('async-sema');
const { RATELIMIT_CALL, DB_PATH, PROVIDER } = require('./config');
const { getEthPrice } = require("./utils");
const Web3 = require('web3');
const web3 = new Web3(PROVIDER)

const ratelimitEthCall = new RateLimit(RATELIMIT_CALL, { timeUnit: 1000, uniformDistribution: true });

const sequelize = new Sequelize('database', 'username', null, {
    dialect: 'sqlite',
    storage: DB_PATH
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

    // Note that we store latest block retrieved at blockNumber -1 for convenience
    var lastRetrievedBlock = await ethPrice.findByPk('-1')
    if (lastRetrievedBlock == null) {
        console.log('Unable to find last retrieved block, intitializing to 10100000 (DEFAULT)')
        lastRetrievedBlock = await ethPrice.create({ block: -1, price: 10100000 })
    }
    // Tmp fix to clear 
    else if (lastRetrievedBlock.price == 10100000) {
        await ethPrice.sync({ force: true })
        console.log('(FORCE CLEAN) Found start default of 10100000 to prevent conflict')
        lastRetrievedBlock = await ethPrice.create({ block: -1, price: 10100000 })
    }

    var latestBlock = await web3.eth.getBlockNumber()
    console.log(`(cacheEthUsd) Missing: ${latestBlock - lastRetrievedBlock.price} / Last: ${lastRetrievedBlock.price} / Latest: ${latestBlock}`)

    var reserveCalls = []
    var latestSavedBlock = lastRetrievedBlock.price // Note that its not actually price
    var intervalsCalled = 0
    for (let i = lastRetrievedBlock.price; i < latestBlock; i++) {
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
    console.log('(cacheEthUsd) Intervals called:', intervalsCalled, '/ Last saved:', latestSavedBlock)

    // Note possible error as we should await first to complete all eth_calls ideally
    lastRetrievedBlock.block = latestSavedBlock // Update last retrieved block and proceed to save
    await lastRetrievedBlock.save()

    // Recursively call set time out every 10s
    setTimeout(cacheAllUsdBlocks, 10000)
}

setTimeout(cacheAllUsdBlocks, 100)