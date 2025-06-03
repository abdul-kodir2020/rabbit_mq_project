import amqplib from 'amqplib'

let connection;
let channel;

function buildRabbitMQUrl() {
    const user = process.env.RABBITMQ_DEFAULT_USER ;
    const pass = process.env.RABBITMQ_DEFAULT_PASS;
    
    return `amqp://${user}:${pass}@localhost:5672`;
}

export async function connectRabbitMQ() {
    try {
        if (!connection) {
            const url = buildRabbitMQUrl();
            console.log('Connecting to RabbitMQ at:', url);
            connection = await amqplib.connect(url);
            channel = await connection.createChannel();
            console.log('Connected to RabbitMQ and channel created');

            // Gérer la fermeture de la connexion
            connection.on('error', (err) => {
                console.error('Connection error:', err);
                connection = null;
                channel = null;
            });

            connection.on('close', () => {
                console.log('Connection closed');
                connection = null;
                channel = null;
            });
        }
        return channel;
    } catch (error) {
        console.error('Error connecting to RabbitMQ:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.error('Make sure RabbitMQ server is running and accessible');
        }
        console.log('Retrying connection in 3 seconds...');
        await new Promise((resolve) => setTimeout(resolve, 3000));
        return connectRabbitMQ(); 
    }
}