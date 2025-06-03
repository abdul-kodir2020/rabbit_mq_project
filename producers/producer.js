import { connectRabbitMQ } from '../common/connect.js'
import { randomInt } from 'crypto';


const EXCHANGE = 'calc_exchange';
const routingKey = 'add'; // ou une routingKey dynamique

(async () => {
  const channel = await connectRabbitMQ();

  await channel.assertExchange(EXCHANGE, 'direct', { durable: true });

  setInterval(() => {
    const a = randomInt(1, 100);
    const b = randomInt(1, 100);

    const payload = { a, b };
    console.log(`Publishing ${routingKey}:`, payload);

    channel.publish(EXCHANGE, routingKey, Buffer.from(JSON.stringify(payload)));
  }, 5000);
})(); 