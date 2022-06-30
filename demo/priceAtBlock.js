const { getEthPrice } = require("../utils");

getEthPrice(14000000).then(res => console.log(res))
getEthPrice().then(res => console.log('Latest:', res))