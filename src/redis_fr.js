const { connect } = require('http2');
const redis = require('redis');
util = require('util');
const Math = require('mathjs');
const client_rabbit = require("./rabbit_fr.js")

// client can be created wrt any legal host and port address to access remote.
// const host = '127.0.0.1'
// const port = '6379'
// const client = redis.createClient(port, host);


const client = redis.createClient();
(async () => (await client.connect()))();
(async () => (await client.on('connect', async function() {
    console.log('[*] Redis Connected!');
})))();

client.on('error', (err) => {
    console.error('!! Redis Error:', err);
});

async function setRedisCounterVal(key, value) {
    try {
        await client.set(key, value)
        console.log(`Set ${key} to ${value} in Redis`);
    } catch(e) {
        console.error(`!! Error setting the val ${value} to key ${key}\n${e}`)
    }
    
}
  
async function GetRedisCounterVal(key) {
    try {
        const value = await client.get(key)
        console.log(`Read ${key} from Redis: ${value}`);
        return value
    } catch(err) {
        console.error("!! assert fail on key value fetch: ", key)
    }
}

function getRandomElement(arr) {
    const randomIndex = Math.floor(Math.random() * arr.length);
    return arr[randomIndex];
}

async function enQueue(value) {
    try {
        console.log('[*] Enqueue update:', value);
        res = await client.rPush('MyQueue', value)
        val = getRandomElement(['Extract', 'Retain']);
        setTimeout(() => {client_rabbit.publishMessage(val)}, 3000);
        console.log('[*] Enqueue updated response: ', res);
    } catch(e) {
        console.error('!! Error enqueueing value:', e);
    }
    };

async function deQueue() {
    try {
        console.log("[*] loading instruction.")
        const task = await client_rabbit.consumeMessages()
        console.log(`[*] instruction: ${task}`)
        if (task == 'Extract') {
            console.log(`[*] Dequeueing MyQueue.`);
            const value = await client.lPop('MyQueue')
            console.log(`[*] Dequeued val ${value}`);
            if (value) {
                return value
            }
        }
        return null
    } catch(e) {
        console.error('!! Error dequeueing value:', e);
    }
}

async function incrCounterVal() {
    const val = await deQueue()
    if (val) {
        try{
            console.log(`[*] The value dequeued, ${val}`)
            const cValue = await client.incr('counter')
            console.log('[*] current counter value:', cValue);
        } catch(iErr) {
            console.error('!! Error incrementing counter:', iErr);
        }
    }
}

module.exports = { client, setRedisCounterVal, GetRedisCounterVal, deQueue, enQueue, incrCounterVal };