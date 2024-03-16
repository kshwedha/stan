const { fork } = require('child_process');
const path = require('path');

console.log("[*] Incrementing counter thread task started.")
const childPath = path.join(__dirname, 'counterProcess.js')
const child1 = fork(childPath);
const child2 = fork(childPath);

console.log('[*] Forked processes for counter increment');

child2.send('thread 2');
child1.send('thread 1');

process.on('SIGINT', () => {
    child1.kill();
    child2.kill();
    process.exit();
});

