const express = require('express');
const cookieParser = require('cookie-parser');

const app = express();

app.use(express.json());
app.use(cookieParser())

// Routes

const authRoutes = require('./routes/auth.routes.js');
const chatRoutes = require('./routes/chat.routes.js');

app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);

module.exports = app;