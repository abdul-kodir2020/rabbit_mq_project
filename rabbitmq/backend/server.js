// Backend Express + WebSocket pour relier le frontend React à RabbitMQ
import express from 'express';
import { consumeResultQueue } from '../consumers/consumer.js';
import http from 'http';
import { Server as SocketIO } from 'socket.io';
import cors from 'cors';
import bodyParser from 'body-parser';
import { connectRabbitMQ } from '../common/connect.js';

const PORT = process.env.PORT || 4000;
const EXCHANGE = 'calc_exchange'; 
const EXCHANGE_FANOUT = 'fanout_exchange'; // Pour l'opération "all"

const app = express();
app.use(cors());
app.use(bodyParser.json());

const server = http.createServer(app);
const io = new SocketIO(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// POST /operation : reçoit une opération du frontend et la publie dans RabbitMQ
app.post('/operation', async (req, res) => {
  const { n1, n2, op } = req.body;
  try {
    const channel = await connectRabbitMQ();
    if (op === "all") {
      await channel.assertExchange(EXCHANGE_FANOUT, "fanout", { durable: true });
      channel.publish(EXCHANGE_FANOUT, '', Buffer.from(JSON.stringify({ n1, n2, op })));
    } else {
      await channel.assertExchange(EXCHANGE, "direct", { durable: true });
      channel.publish(EXCHANGE, op, Buffer.from(JSON.stringify({ n1, n2, op })));
    }
    res.status(200).json({ status: 'ok' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// WebSocket : push les résultats reçus de RabbitMQ au client
io.on('connection', (socket) => {
  console.log('Frontend connecté au WebSocket');
});

// Démarre l'écoute avec la logique WebSocket comme callback
consumeResultQueue((result) => {
  console.log('Emitting result to frontend via WebSocket:', result);
  io.emit('result', result);
});

server.listen(PORT, () => {
  console.log('Backend API/WS démarré sur le port', PORT);
});
