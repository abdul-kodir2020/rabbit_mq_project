import { connectRabbitMQ } from '../common/connect.js'

async function testConnection() {
    try {
        const channel = await connectRabbitMQ();
        console.log('Successfully connected to RabbitMQ!');
        
        // Créer une queue de test
        const queueName = 'test_queue';
        await channel.assertQueue(queueName, { durable: false });
        
        // Envoyer un message de test
        const message = { test: 'Hello RabbitMQ!' };
        channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)));
        console.log('Test message sent:', message);
        
        // Fermer la connexion après 2 secondes
        setTimeout(() => {
            channel.connection.close();
            console.log('Connection closed');
            process.exit(0);
        }, 2000);
        
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

testConnection();