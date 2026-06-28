const crypto = require("crypto");
const pool = require("../db");

const KEYCLOAK_URL = process.env.KEYCLOAK_URL || "http://keycloak:8080";
const JWKS_URI = `${KEYCLOAK_URL}/realms/animal-help-app/protocol/openid-connect/certs`;

async function verifyKeycloakToken(token) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const header = JSON.parse(Buffer.from(parts[0], "base64url").toString());
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString());

    const response = await fetch(JWKS_URI);
    const { keys } = await response.json();

    const key = keys.find(k => k.kid === header.kid);
    if (!key) return null;

    const cert = `-----BEGIN CERTIFICATE-----\n${key.x5c[0].match(/.{1,64}/g).join("\n")}\n-----END CERTIFICATE-----\n`;

    const verify = crypto.createVerify("RSA-SHA256");
    verify.update(parts[0] + "." + parts[1]);
    const isValid = verify.verify(cert, parts[2], "base64url");

    if (!isValid) return null;
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;

    return payload;
  } catch {
    return null;
  }
}

async function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Missing token" });
  }

  const payload = await verifyKeycloakToken(token);

  if (!payload) {
    return res.status(403).json({ error: "Invalid token" });
  }

  try {
    const roles = payload.realm_access?.roles || [];
    const role = ["admin", "volunteer", "user"].find(r => roles.includes(r)) || "user";

    const result = await pool.query(
      `INSERT INTO users (email, password_hash, role)
       VALUES ($1, '', $2)
       ON CONFLICT (email) DO UPDATE SET last_login_at = NOW()
       RETURNING id`,
      [payload.email, role]
    );

    req.user = { id: result.rows[0].id, role, email: payload.email };
    next();
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
}

function requireRole(roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  };
}

async function authenticateServiceToken(req, res, next) {
  const token = (req.headers["authorization"] || "").split(" ")[1];
  if (!token) return res.status(401).json({ error: "Missing token" });

  const payload = await verifyKeycloakToken(token);
  if (!payload) return res.status(403).json({ error: "Invalid token" });

  req.client = { sub: payload.sub, clientId: payload.azp };
  next();
}

module.exports = { authenticateToken, requireRole, authenticateServiceToken };
