import amqplib from 'amqplib'

async function connectRabbitMQ() {
    try {
        if (!connection) {
            console.log('Connecting to RabbitMQ...');
            connection = await amqplib.connect(process.env.RABBITMQ_URL);
            channel = await connection.createChannel();
            console.log('Connected to RabbitMQ and channel created');
        }
        return channel;
    } catch (error) {
        console.error('Error connecting to RabbitMQ:', error.message);
        console.log('Retrying connection in 5 seconds...');
        await new Promise((resolve) => setTimeout(resolve, 3000)); //Retry après 3 secondes
        return connectRabbitMQ(); 
    }
}

module.exports = connectRabbitMQ