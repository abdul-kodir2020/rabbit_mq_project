import dotenv from 'dotenv'
dotenv.config()

const env = {
    RABBITMQ_URL : process.env.RABBITMQ_URL || "amqp://user:password@localhost:5672"
}

export default env