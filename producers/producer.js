import { connectRabbitMQ } from '../common/connect.js'
import { randomInt } from 'crypto';


const EXCHANGE = 'calc_exchange';
const operations = ['add', 'sub', 'mul', 'div', 'all'];

(async () => {
  const channel = await connectRabbitMQ();

  await channel.assertExchange(EXCHANGE, 'direct', { durable: true });

  setInterval(() => {
    const n1 = randomInt(1, 100);
    const n2 = randomInt(1, 100);
    const routingKey = operations[randomInt(operations.length)];

    const payload = { n1, n2, operation: routingKey };
    console.log(`Publishing ${routingKey}:`, payload);

    channel.publish(EXCHANGE, routingKey, Buffer.from(JSON.stringify(payload)));
  }, randomInt(1000, 5000));
})(); 