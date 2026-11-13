import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import os from 'node:os';
import { corsOptions } from './config/cors.js';
import { requestLogger } from './middleware/requestLogger.js';
import { verifyMailConnection } from './config/mail.js';
import apiRoutes from './routes/index.js';
import authRoutes from './routes/auth.routes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0'; // Binds to all network interfaces on this machine

// Helper: Dynamically get this computer's active LAN IPv4 address
const getActiveLocalIp = () => {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
};

// 1. Universal CORS Configuration (Accepts ANY Origin & ANY IP)
app.use(cors(corsOptions));

// 2. Preflight & Wildcard Origin Handler
app.use((req, res, next) => {
  const requestOrigin = req.headers.origin || '*';
  res.header('Access-Control-Allow-Origin', requestOrigin);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.header('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// 3. Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 4. Request Logger
app.use(requestLogger);

// 5. Server Health Check
app.get('/', (req, res) => {
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const activeIp = getActiveLocalIp();

  res.json({
    status: 'ONLINE',
    service: 'Ulavan Santhai API',
    clientIp,
    activeHostIp: activeIp,
    serverUrls: {
      local: `http://localhost:${PORT}`,
      activeLan: `http://${activeIp}:${PORT}`,
      allInterfaces: `http://${HOST}:${PORT}`,
    },
    time: new Date().toISOString(),
  });
});

// 6. Mount API Routes
app.use('/api', apiRoutes);
app.use('/auth', authRoutes); // Fallback without /api prefix

// 7. Error Handling
app.use(notFound);
app.use(errorHandler);

// 8. Start Server on all interfaces (0.0.0.0)
let server = null;
if (process.env.NODE_ENV !== 'test') {
  server = app.listen(PORT, HOST, async () => {
    const activeIp = getActiveLocalIp();

    console.log(`\n=============================================================`);
    console.log(`[SERVER] Running & Listening on ALL Interfaces (0.0.0.0:${PORT})`);
    console.log(`  Local Machine:     http://localhost:${PORT}`);
    console.log(`  Active Network IP: http://${activeIp}:${PORT}`);
    console.log(`[CORS] UNIVERSAL: Accepting requests from ANY IP & ANY ORIGIN`);
    console.log(`=============================================================\n`);

    await verifyMailConnection();
  });
}

export { app, server };
export default app;
