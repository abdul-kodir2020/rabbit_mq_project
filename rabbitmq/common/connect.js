import amqplib from 'amqplib'
import env from '../export_env.js'

let connection;
let channel;

export async function connectRabbitMQ() {
    try {
        if (!connection) {
            if (!env.RABBITMQ_URL) {
                throw new Error('RABBITMQ_URL is not defined in environment variables');
            }
            console.log('Connecting to RabbitMQ at:', env.RABBITMQ_URL);
            connection = await amqplib.connect(env.RABBITMQ_URL);
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