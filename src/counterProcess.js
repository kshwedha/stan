const client_redis = require('./redis_fr');
const client_rabbit = require("./rabbit_fr.js")

function InitProcess() {
    client_redis.enQueue(Date.now().toString())
    client_redis.incrCounterVal()
}

process.on('message', (message) => {
    console.log(`[*] Executing ${message}`)
    setInterval(InitProcess, 2000)
});