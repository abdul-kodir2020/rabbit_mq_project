import { connectRabbitMQ } from '../common/connect.js';

export async function consumeResultQueue(callback) {
  const queue = 'result_queue';
  const channel = await connectRabbitMQ();

  await channel.assertQueue(queue, { durable: true });
  console.log('Consumer listening for messages on queue:', queue);

  channel.consume(queue, (msg) => {
    if (msg !== null) {
      try {
        const payload = JSON.parse(msg.content.toString());
        callback(payload); 
        channel.ack(msg); 
      } catch (e) {
        console.error('Error processing message:', e.message);
        channel.nack(msg, false, false); 
      }
    }
  });
}
