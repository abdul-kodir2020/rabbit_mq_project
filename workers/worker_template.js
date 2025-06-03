import { connectRabbitMQ } from '../common/connect.js'

import { randomInt } from 'crypto';

const EXCHANGE = 'calc_exchange';
var args = process.argv.slice(2)
const routingKey = args[0] || 'add';

const calculate = (payload, opps) => {
    if (opps === 'add') {
        return payload.n1 + payload.n2;
    }else if (opps === 'sub') {    
        return payload.n1 - payload.n2; 
    }else if (opps === 'mul') {
        return payload.n1 * payload.n2;
    }else if (opps === 'div') {  
        if (payload.n2 === 0) {
            throw new Error('Division by zero is not allowed');
        }
        return payload.n1 / payload.n2;
    }
}

(async () => {
    const channel = await connectRabbitMQ();
    await channel.assertExchange(EXCHANGE, 'direct', { durable: true });

    const q = await channel.assertQueue(routingKey + '_queue' , { durable: false });
    await channel.bindQueue(q.queue, EXCHANGE, routingKey);
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
                await channel.assertQueue('result_queue', { durable: false });
                channel.prefetch(1); // Ensure only one message is processed at a time
                console.log(`Publishing result for ${routingKey} to result_queue`);
                channel.sendToQueue('result_queue', Buffer.from(JSON.stringify({ n1: payload.a, n2: payload.b, opps: routingKey, result })));
            }, randomInt(5000, 15000)); // wait between 5 and 15 seconds
            
        }
    });

})();

