module.exports = {
    //PROVIDER: 'https://eth-mainnet.alchemyapi.io/v2/API_KEY_HERE',
    //PROVIDER: 'http://localhost:8545', // If running on same machine
    DB_PATH: `${__dirname}/./db/database.sqlite`,
    // Rate limit params
    RATELIMIT_CALL: 10, // Set rate limit of calls per second. Set to 
    // Debug
    ENABLE_SQL_LOGS: false // Disabled for start at least due to lots of spam by the writes
}