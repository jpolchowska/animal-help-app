const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.static('public'));
app.set('view engine', 'ejs');

const PORT = process.env.PORT || 3003;
const API_URL = process.env.API_URL || 'http://localhost:3001';
const KEYCLOAK_INTERNAL_URL = process.env.KEYCLOAK_INTERNAL_URL || 'http://localhost:8080';
const REALM = 'animal-help-app';
const CLIENT_ID = process.env.CLIENT_ID || 'b2b-client';
const CLIENT_SECRET = process.env.CLIENT_SECRET || '';

const TOKEN_ENDPOINT = `${KEYCLOAK_INTERNAL_URL}/realms/${REALM}/protocol/openid-connect/token`;

app.get('/', async (req, res) => {
  try {
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', CLIENT_ID);
    params.append('client_secret', CLIENT_SECRET);

    const tokenResponse = await axios.post(TOKEN_ENDPOINT, params);
    const accessToken = tokenResponse.data.access_token;

    const reportResponse = await axios.get(`${API_URL}/report`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const report = reportResponse.data;
    const available = report.animals.byStatus['Do adopcji'] || report.animals.byStatus['available'] || 0;
    const adopted  = report.animals.byStatus['Zaadoptowane'] || report.animals.byStatus['adopted'] || 0;
    const treatment = report.animals.byStatus['W trakcie leczenia'] || report.animals.byStatus['treatment'] || 0;

    // build per-species map: { Pies: { total, male, female, avgAge, minAge, maxAge }, ... }
    const species = {};
    report.animals.byType.forEach(t => {
      species[t.type] = { total: t.count, male: 0, female: 0, avgAge: null, minAge: null, maxAge: null };
    });
    (report.animals.sexByType || []).forEach(r => {
      if (!species[r.type]) return;
      if (r.sex === 'Samiec' || r.sex === 'male') species[r.type].male = r.count;
      else if (r.sex === 'Samica' || r.sex === 'female') species[r.type].female = r.count;
    });
    (report.animals.ageByType || []).forEach(r => {
      if (!species[r.type]) return;
      species[r.type].avgAge = r.avg;
      species[r.type].minAge = r.min;
      species[r.type].maxAge = r.max;
    });

    res.render('report', {
      report,
      species,
      derived: {
        available,
        adopted,
        treatment,
        availableRate: report.animals.total > 0 ? Math.round((available / report.animals.total) * 100) : 0,
      },
      fullToken: accessToken,
    });
  } catch (err) {
    console.error('B2B error:', err.response?.data || err.message);
    res.status(500).render('error', { message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`B2B client running on port ${PORT}`);
});
