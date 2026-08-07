<<<<<<< HEAD
const http = require('http');
=======
>>>>>>> 79dc160d18ec2038869e85b879f4b077f7e367b1
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
<<<<<<< HEAD
const { corsOptions } = require('./config/cors');
=======
>>>>>>> 79dc160d18ec2038869e85b879f4b077f7e367b1
const { errorHandler } = require('./middleware/errorMiddleware');

dotenv.config();

connectDB();

const app = express();

<<<<<<< HEAD
// Render, Railway and most PaaS hosts sit behind a load balancer. Without
// this, req.protocol is always 'http' and req.ip is the proxy's address.
app.set('trust proxy', 1);

app.use(cors(corsOptions));
=======
app.use(cors());
>>>>>>> 79dc160d18ec2038869e85b879f4b077f7e367b1
app.use(express.json());

app.get('/', (req, res) => {
    res.send('API is running...');
});

<<<<<<< HEAD
// Health check. Render pings this to decide whether a deploy went live, and
// it doubles as a cheap keep-alive target on the free tier.
app.get('/healthz', (req, res) => {
    res.status(200).json({
        status: 'ok',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
    });
});

=======
>>>>>>> 79dc160d18ec2038869e85b879f4b077f7e367b1
// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/notes', require('./routes/noteRoutes'));
app.use('/api/support', require('./routes/supportRoutes'));
app.use('/api/invite', require('./routes/inviteRoutes'));
<<<<<<< HEAD
app.use('/api/github', require('./routes/githubRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/search', require('./routes/searchRoutes'));
=======
>>>>>>> 79dc160d18ec2038869e85b879f4b077f7e367b1

app.use(errorHandler);


const PORT = process.env.PORT || 5001;
<<<<<<< HEAD

// Express is wrapped in a bare http server so Socket.IO can share the port.
const server = http.createServer(app);

// Realtime transport for the Activity Feed and Notification Center.
// If socket.io isn't installed this logs a warning and the app falls back to
// REST polling, so the server still boots.
require('./services/realtimeService').init(server);

// Hosts inject PORT and expect the process to bind 0.0.0.0, not localhost.
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);

    // Background GitHub sync: refreshes connected repos and auto-completes
    // tasks whose pull requests have been merged.
    require('./services/githubSyncService').startPolling();

    // Emits "due tomorrow" / "overdue" notifications on a timer.
    require('./services/deadlineService').startPolling();
});

// PaaS platforms send SIGTERM before replacing a container. Closing cleanly
// lets in-flight requests finish instead of being cut off mid-response.
const shutdown = (signal) => () => {
    console.log(`${signal} received, shutting down...`);
    server.close(() => process.exit(0));
    // Don't hang forever if a socket refuses to drain.
    setTimeout(() => process.exit(1), 10_000).unref();
};

process.on('SIGTERM', shutdown('SIGTERM'));
process.on('SIGINT', shutdown('SIGINT'));

module.exports = { app, server };
=======
app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
>>>>>>> 79dc160d18ec2038869e85b879f4b077f7e367b1
