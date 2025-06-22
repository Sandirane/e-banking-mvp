console.log('DEBUG env variable:', process.env.DEBUG);

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { checkJwt } = require('./config/keycloak');
const accountsRoutes = require('./routes/accounts');
const transactionsRoutes = require('./routes/transactions');

const { requireRole } = require('./config/roles');
const adminRoutes = require('./routes/admin'); 
const pool = require('./config/db');

const app = express();

app.use(cors({ origin: 'http://localhost:4200', credentials: true }));
app.use(express.json());

// global log
app.use((req, res, next) => {
  console.log('→ Incoming request:', req.method, req.originalUrl);
  console.log('Authorization header:', req.headers.authorization);
  next();
});

// public route 
app.get('/', (req, res) => res.send('API e-banking running...'));

// if token ok route
app.use(
  '/api/accounts',
  checkJwt,
  (req, res, next) => {
    console.log('JWT OK /api/accounts, req.auth =', req.auth);
    next();
  },
  accountsRoutes
);

app.use(
  '/api/transactions',
  checkJwt,
  (req, res, next) => {
    console.log('JWT OK /api/transactions, req.auth =', req.auth);
    next();
  },
  transactionsRoutes
);

app.get('/api/profile', checkJwt, (req, res) => { 
  const { sub, preferred_username, email, given_name, family_name } = req.auth;
  res.json({ userId: sub, username: preferred_username, email, givenName: given_name, familyName: family_name });
});

// Routes admin
app.use('/api/admin', checkJwt, requireRole('admin'), adminRoutes);

// errors server or JWT 
app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    console.error('JWT validation error:', err.message);
    return res.status(401).json({ message: 'Invalid token', details: err.message });
  }
  console.error('Express error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// server run port 
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));