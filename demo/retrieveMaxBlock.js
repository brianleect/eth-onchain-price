
const { Sequelize, QueryTypes } = require("sequelize");
const { RATELIMIT_CALL, DB_PATH, PROVIDER } = require('../config');

const sequelize = new Sequelize('database', 'username', null, {
    dialect: 'sqlite',
    storage: DB_PATH,
})

// Note that the table is saved as ethPrices

sequelize.query('SELECT MAX(block) FROM ethPrices', { type: QueryTypes.SELECT })
    .then(res => {
        console.log(res)
        console.log(res[0]['MAX(block)'])
    })