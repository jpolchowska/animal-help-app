const express = require("express");
const pool = require("../db");
const { authenticateToken, requireRole } = require("../middleware/auth");

const router = express.Router();

const KEYCLOAK_URL = process.env.KEYCLOAK_URL || "http://keycloak:8080";
const REALM = "animal-help-app";

router.post("/join", authenticateToken, requireRole(["user"]), async (req, res) => {
  const adminUser = process.env.KEYCLOAK_ADMIN || "admin";
  const adminPass = process.env.KEYCLOAK_ADMIN_PASSWORD || "admin";

  try {
    const tokenParams = new URLSearchParams();
    tokenParams.append("grant_type", "password");
    tokenParams.append("client_id", "admin-cli");
    tokenParams.append("username", adminUser);
    tokenParams.append("password", adminPass);

    const tokenRes = await fetch(`${KEYCLOAK_URL}/realms/master/protocol/openid-connect/token`, {
      method: "POST",
      body: tokenParams,
    });
    const { access_token: adminToken } = await tokenRes.json();

    const usersRes = await fetch(
      `${KEYCLOAK_URL}/admin/realms/${REALM}/users?email=${encodeURIComponent(req.user.email)}&exact=true`,
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    const kcUsers = await usersRes.json();
    const kcUser = kcUsers[0];
    if (!kcUser) return res.status(404).json({ error: "User not found in Keycloak" });

    const [volunteerRoleRes, userRoleRes] = await Promise.all([
      fetch(`${KEYCLOAK_URL}/admin/realms/${REALM}/roles/volunteer`, { headers: { Authorization: `Bearer ${adminToken}` } }),
      fetch(`${KEYCLOAK_URL}/admin/realms/${REALM}/roles/user`, { headers: { Authorization: `Bearer ${adminToken}` } }),
    ]);
    const volunteerRole = await volunteerRoleRes.json();
    const userRole = await userRoleRes.json();

    await fetch(`${KEYCLOAK_URL}/admin/realms/${REALM}/users/${kcUser.id}/role-mappings/realm`, {
      method: "POST",
      headers: { Authorization: `Bearer ${adminToken}`, "Content-Type": "application/json" },
      body: JSON.stringify([{ id: volunteerRole.id, name: volunteerRole.name }]),
    });

    await fetch(`${KEYCLOAK_URL}/admin/realms/${REALM}/users/${kcUser.id}/role-mappings/realm`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${adminToken}`, "Content-Type": "application/json" },
      body: JSON.stringify([{ id: userRole.id, name: userRole.name }]),
    });

    await pool.query("UPDATE users SET role = 'volunteer' WHERE id = $1", [req.user.id]);

    res.json({ message: "You are now a volunteer" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
