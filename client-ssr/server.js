const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const session = require('express-session');

const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false },
}));

const PORT = process.env.PORT || 3002;
const API_URL = process.env.API_URL || 'http://localhost:3001';
const KEYCLOAK_EXTERNAL_URL = process.env.KEYCLOAK_EXTERNAL_URL || 'http://localhost:8080';
const KEYCLOAK_INTERNAL_URL = process.env.KEYCLOAK_INTERNAL_URL || 'http://localhost:8080';
const REALM = 'animal-help-app';
const CLIENT_ID = process.env.CLIENT_ID || 'ssr-client';
const CLIENT_SECRET = process.env.CLIENT_SECRET || '';
const REDIRECT_URI = process.env.REDIRECT_URI || 'http://localhost:3002/callback';

const AUTH_ENDPOINT = `${KEYCLOAK_EXTERNAL_URL}/realms/${REALM}/protocol/openid-connect/auth`;
const TOKEN_ENDPOINT = `${KEYCLOAK_INTERNAL_URL}/realms/${REALM}/protocol/openid-connect/token`;

function base64url(buffer) {
  return buffer.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

const pkceStore = {};

app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/login', (req, res) => {
  const verifier = base64url(crypto.randomBytes(32));
  const challenge = base64url(crypto.createHash('sha256').update(verifier).digest());
  const state = crypto.randomBytes(16).toString('hex');

  pkceStore[state] = verifier;

  const authUrl = `${AUTH_ENDPOINT}?response_type=code&client_id=${CLIENT_ID}&state=${state}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&code_challenge=${challenge}&code_challenge_method=S256&scope=openid profile email`;

  res.redirect(authUrl);
});

app.get('/callback', async (req, res) => {
  const { code, state } = req.query;
  const verifier = pkceStore[state];
  delete pkceStore[state];

  if (!verifier) return res.redirect('/');

  try {
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('client_id', CLIENT_ID);
    params.append('client_secret', CLIENT_SECRET);
    params.append('redirect_uri', REDIRECT_URI);
    params.append('code_verifier', verifier);
    params.append('code', code);

    const result = await axios.post(TOKEN_ENDPOINT, params);
    const { access_token, id_token } = result.data;

    const payload = JSON.parse(Buffer.from(id_token.split('.')[1], 'base64url').toString());

    req.session.token = access_token;
    req.session.user = {
      name: payload.given_name || payload.preferred_username,
      email: payload.email,
    };

    res.redirect('/');
  } catch (err) {
    console.error('Token exchange error:', err.message);
    res.redirect('/');
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

app.listen(PORT, () => {
  console.log(`SSR client running on port ${PORT}`);
});
