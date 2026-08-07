const http = require('http');
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('API is running...');
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/notes', require('./routes/noteRoutes'));
app.use('/api/support', require('./routes/supportRoutes'));
app.use('/api/invite', require('./routes/inviteRoutes'));
app.use('/api/github', require('./routes/githubRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/search', require('./routes/searchRoutes'));

app.use(errorHandler);


const PORT = process.env.PORT || 5001;

// Express is wrapped in a bare http server so Socket.IO can share the port.
const server = http.createServer(app);

// Realtime transport for the Activity Feed and Notification Center.
// If socket.io isn't installed this logs a warning and the app falls back to
// REST polling, so the server still boots.
require('./services/realtimeService').init(server);

server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);

    // Background GitHub sync: refreshes connected repos and auto-completes
    // tasks whose pull requests have been merged.
    require('./services/githubSyncService').startPolling();

    // Emits "due tomorrow" / "overdue" notifications on a timer.
    require('./services/deadlineService').startPolling();
});

module.exports = { app, server };
