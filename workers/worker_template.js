import { connectRabbitMQ } from '../common/connect.js'

import { randomInt } from 'crypto';

const EXCHANGE = 'calc_exchange';
const EXCHANGE_FANOUT = 'fanout_exchange';
var args = process.argv.slice(2)

if(args[0] === undefined || args[0] === '') {
    console.error('Please provide a routing key as an argument (e.g., add, sub, mul, div)');
    process.exit(1);
}

const routingKey = args[0];

const calculate = (payload, op) => {
  const { n1, n2 } = payload;
  switch (op) {
    case 'add': return n1 + n2;
    case 'sub': return n1 - n2;
    case 'mul': return n1 * n2;
    case 'div':
      if (n2 === 0) throw new Error('Division by zero is not allowed');
      return n1 / n2;
    default: throw new Error(`Unsupported operation: ${op}`);
  }
};

(async () => {
    const channel = await connectRabbitMQ();
    await channel.assertExchange(EXCHANGE, 'direct', { durable: true });
    await channel.assertExchange(EXCHANGE_FANOUT, 'fanout', { durable: true });
    const q = await channel.assertQueue(routingKey + '_queue' , { durable: true });
    await channel.bindQueue(q.queue, EXCHANGE, routingKey);
    await channel.bindQueue(q.queue, EXCHANGE_FANOUT, '');
    console.log(`Worker listening for ${routingKey} messages on queue: ${routingKey}_queue`);

    channel.consume(q.queue, (msg) => {
        if (msg !== null) {
            const payload = JSON.parse(msg.content.toString());
            console.log(`Received ${routingKey}:`, payload);
            channel.ack(msg); // Acknowledge the message
            console.log(`Processing ${routingKey} for payload:`, payload);

            setTimeout(async () => {
                console.log(`Waiting for 5 to 15 seconds before processing ${routingKey}...`);
                const result = calculate(payload, routingKey);
                console.log(`Result for ${routingKey} with payload:`, payload, 'is', result);
                // Here you can publish the result to another exchange or queue if needed
                await channel.assertQueue('result_queue', { durable: true });
                channel.prefetch(1); // Ensure only one message is processed at a time
                console.log(`Publishing result for ${routingKey} to result_queue`);
                channel.sendToQueue('result_queue', Buffer.from(JSON.stringify({ n1: payload.n1, n2: payload.n2, op: routingKey, result })));
            }, randomInt(5000, 15000)); // wait between 5 and 15 seconds
            
        }
    });

})();
