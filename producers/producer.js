import { connectRabbitMQ } from '../common/connect.js'
import { randomInt } from 'crypto';


const DIRECT_EXCHANGE = 'calc_exchange';
const FANOUT_EXCHANGE = 'fanout_exchange';
const operations = ['add', 'sub', 'mul', 'div', 'all'];

(async () => {
  const channel = await connectRabbitMQ();

  await channel.assertExchange(DIRECT_EXCHANGE, 'direct', { durable: true });
  await channel.assertExchange(FANOUT_EXCHANGE, 'fanout', { durable: true });

  setInterval(() => {
    const n1 = randomInt(1, 100);
    const n2 = randomInt(1, 100);
    const routingKey = operations[randomInt(operations.length)];
    const payload = { n1, n2 };

    console.log(`Publishing ${routingKey}:`, payload);

   if (routingKey === 'all') {
      channel.publish(FANOUT_EXCHANGE, '', Buffer.from(JSON.stringify(payload)));
    } else {
      channel.publish(DIRECT_EXCHANGE, routingKey, Buffer.from(JSON.stringify(payload)));
    }
  }, randomInt(1000, 5000));
})(); 