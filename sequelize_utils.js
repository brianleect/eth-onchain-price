const { Sequelize, Op, Model, DataTypes, QueryTypes } = require("sequelize");
const { DB_PATH, ENABLE_SQL_LOGS } = require('./config');

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

async function getEthPriceDB(block) {
    var { dataValues } = await ethPrice.findByPk(block)
    return { 'block': dataValues.block, 'price': dataValues.price }
}

async function getEthPriceMultipleDB(block_list) {
    var multPriceRes = await ethPrice.findAll({
        where: {
            block: {
                [Op.or]: block_list
            }
        }
    })
    // console.log(multPriceRes)
    var multOutput = {}
    // Use of object destructuring to retrieve key value
    multPriceRes.forEach(({ dataValues }) => multOutput[dataValues.block] = dataValues.price)

    return multOutput
}

module.exports = { getEthPriceDB, getEthPriceMultipleDB }