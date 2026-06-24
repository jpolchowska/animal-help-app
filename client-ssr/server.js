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
const API_PUBLIC_URL = process.env.API_PUBLIC_URL || 'http://localhost:3001';
const PORTAL_URL = process.env.PORTAL_URL || 'http://localhost:3000';
const KEYCLOAK_EXTERNAL_URL = process.env.KEYCLOAK_EXTERNAL_URL || 'http://localhost:8080';
const KEYCLOAK_INTERNAL_URL = process.env.KEYCLOAK_INTERNAL_URL || 'http://localhost:8080';
const REALM = 'animal-help-app';
const CLIENT_ID = process.env.CLIENT_ID || 'ssr-client';
const CLIENT_SECRET = process.env.CLIENT_SECRET || '';
const REDIRECT_URI = process.env.REDIRECT_URI || 'http://localhost:3002/callback';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3002/google/callback';

const AUTH_ENDPOINT = `${KEYCLOAK_EXTERNAL_URL}/realms/${REALM}/protocol/openid-connect/auth`;
const TOKEN_ENDPOINT = `${KEYCLOAK_INTERNAL_URL}/realms/${REALM}/protocol/openid-connect/token`;

function base64url(buffer) {
  return buffer.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function statusLabel(s) {
  const map = {
    available: 'Do adopcji', 'Do adopcji': 'Do adopcji',
    adopted: 'Zaadoptowane', Zaadoptowane: 'Zaadoptowane',
    treatment: 'W trakcie leczenia', 'W trakcie leczenia': 'W trakcie leczenia',
  };
  return map[s] || s;
}

function statusClass(s) {
  if (s === 'available' || s === 'Do adopcji') return 'available';
  if (s === 'adopted' || s === 'Zaadoptowane') return 'adopted';
  return 'treatment';
}

function adoptionStatusClass(s) {
  if (s === 'Zaakceptowany') return 'adopted';
  if (s === 'Odrzucony') return 'treatment';
  return 'pending';
}

const pkceStore = {};

app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

function authRequired(req, res, next) {
  if (!req.session.token) return res.redirect('/login');
  next();
}

app.get('/', async (req, res) => {
  try {
    const [animalsRes, statsRes] = await Promise.all([
      axios.get(`${API_URL}/animals`),
      axios.get(`${API_URL}/stats`),
    ]);

    const animals = animalsRes.data;
    const apiStats = statsRes.data;

    const stats = {
      total: animals.length,
      available: animals.filter(a => a.status === 'available' || a.status === 'Do adopcji').length,
      adopted: apiStats.adopted,
      volunteers: apiStats.volunteers,
    };

    res.render('index', {
      animals: animals.slice(0, 10),
      stats,
      apiPublicUrl: API_PUBLIC_URL,
      statusLabel,
      statusClass,
    });
  } catch (err) {
    console.error('Home fetch error:', err.message);
    res.render('index', {
      animals: [],
      stats: { total: 0, available: 0, adopted: 0, volunteers: 0 },
      apiPublicUrl: API_PUBLIC_URL,
      statusLabel,
      statusClass,
    });
  }
});

app.get('/animals', async (req, res) => {
  try {
    const animalsRes = await axios.get(`${API_URL}/animals`);
    res.render('animals', {
      animals: animalsRes.data,
      apiPublicUrl: API_PUBLIC_URL,
      portalUrl: PORTAL_URL,
      statusLabel,
      statusClass,
    });
  } catch (err) {
    console.error('Animals fetch error:', err.message);
    res.render('animals', {
      animals: [],
      apiPublicUrl: API_PUBLIC_URL,
      portalUrl: PORTAL_URL,
      statusLabel,
      statusClass,
    });
  }
});

app.get('/my-adoptions', authRequired, async (req, res) => {
  try {
    const result = await axios.get(`${API_URL}/adoptions/my`, {
      headers: { Authorization: `Bearer ${req.session.token}` },
    });
    res.render('my-adoptions', {
      adoptions: result.data,
      apiPublicUrl: API_PUBLIC_URL,
      adoptionStatusClass,
    });
  } catch {
    res.render('my-adoptions', {
      adoptions: [],
      apiPublicUrl: API_PUBLIC_URL,
      adoptionStatusClass,
    });
  }
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

app.get('/google', (req, res) => {
  const state = crypto.randomBytes(16).toString('hex');
  req.session.googleState = state;

  const authUrl = 'https://accounts.google.com/o/oauth2/v2/auth?' + new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: 'code',
    scope: 'openid profile email',
    state,
    access_type: 'offline',
  });

  res.redirect(authUrl);
});

app.get('/google/callback', async (req, res) => {
  const { code, state } = req.query;

  if (state !== req.session.googleState) {
    return res.redirect('/');
  }
  delete req.session.googleState;

  try {
    const tokenRes = await axios.post('https://oauth2.googleapis.com/token', new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: GOOGLE_REDIRECT_URI,
    }));

    const { access_token } = tokenRes.data;

    const profileRes = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    res.render('google-profile', { profile: profileRes.data });
  } catch (err) {
    console.error('Google OAuth error:', err.message);
    res.redirect('/');
  }
});

app.listen(PORT, () => {
  console.log(`SSR client running on port ${PORT}`);
});
