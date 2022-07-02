const { getEthPriceMultipleDB, getEthPriceDB } = require("../sequelize_utils");

getEthPriceDB(12000000).then(res => console.log(`(SINGLE) DB price:`, res))
getEthPriceMultipleDB([12000000, 12000001, 12000002]).then(res => console.log(`(MULT) DB price:`, res))