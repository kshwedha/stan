const amqp = require('amqplib');
const queue = 'queue'

let rabbitMQChannel;

async function getRabbitMQChannel() {
    if (!rabbitMQChannel) {
        const connection = await amqp.connect('amqp://localhost');

        rabbitMQChannel = await connection.createChannel();
    }

    return rabbitMQChannel;
}

async function publishMessage(message) {
    const channel = await getRabbitMQChannel();
    channel.assertQueue(queue);
    channel.sendToQueue(queue, Buffer.from(message));
    console.log('[*] sent message:', message);
}

async function consumeMessages() {
    const channel = await getRabbitMQChannel();
    channel.assertQueue(queue);

    // below commented instructions consumes all teh unread arrivals.
    // channel.consume(queue, message => {
    //     if (message !== null) {
    //         console.log('Received message:', message.content.toString());
    //         channel.ack(message);
    //     }
    // });

    const message = await channel.get(queue);
    if (message) {
        console.log('[*] Received message:', message.content.toString());
        channel.ack(message);
        return message.content.toString()
    } else {
        console.log('!! No message in the queue');
    }
    return null
}

module.exports = { publishMessage, consumeMessages }