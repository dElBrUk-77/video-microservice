const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const videoRoutes = require('./routes/videoRoutes');
const adminRoutes = require('./routes/adminRoutes');
const superRoutes = require('./routes/superRoutes');
const socialRoutes = require('./routes/socialRoutes');

const app = express();

const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',').map(o => o.trim());
const corsOptions = {
  origin: function(origin, callback) {
    // Permitir todas las peticiones para el MVP
    callback(null, true);
  },
  credentials: true
};

app.use(cors(corsOptions));
app.use(bodyParser.json());

// Rutas
app.use('/auth', authRoutes);
app.use('/videos', videoRoutes);
app.use('/admin', adminRoutes);
app.use('/super', superRoutes);
app.use('/social', socialRoutes);

module.exports = app;
