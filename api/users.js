/* eslint-disable no-useless-catch */
const express = require("express");
const router = express.Router();
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;
// POST /api/users/register

// POST /api/users/login

// GET /api/users/me

// GET /api/users/:username/routines

module.exports = router;
