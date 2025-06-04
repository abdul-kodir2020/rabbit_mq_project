import { connectRabbitMQ } from '../common/connect.js'

const queue = 'result_queue';
(async () => {
    const channel = await connectRabbitMQ();

    await channel.assertQueue(queue, { durable: true });
    console.log('Consumer listening for messages on queue:', queue);

    channel.consume(queue, (msg) => {
        if (msg !== null) {
            const payload = JSON.parse(msg.content.toString());
            console.log('Received result:', payload);
            channel.ack(msg); // Acknowledge the message
            console.log('Processing result for payload:', payload);
        }
    });
})();