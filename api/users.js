/* eslint-disable no-useless-catch */
const express = require("express");
const router = express.Router();
const { getUserByUsername, createUser } = require("../db");
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;

// router.use((req, res, next) => {
//       console.log("A request is being made to /users");
//       next();
// });

// POST /api/users/register

router.post('/register', async (req, res, next) => {
      const { username, password } = req.body;
      //console.log(req.body);
      try {
            const _user = await getUserByUsername(username);

            if (_user) {
                  res.send({
                        error: 'UserExistsError',
                        message: 'User ' + username + ' is already taken.',
                        name: 'UserExistsError'
                  });
            }

            if (password.length < 8) {
                  res.send({
                        error: 'PasswordTooShortError',
                        message: 'Password Too Short!',
                        name: 'Password Too Short!'
                  });
            }

            const user = await createUser({ username, password });

            const token = jwt.sign({
                  id: user.id,
                  username
            }, process.env.JWT_SECRET, {
                  expiresIn: '1w'
            });

            res.send({ message: "thank you for signing up", token, user });

      } catch ({ name, message }) {
            next({ name, message })
      }
});

// POST /api/users/login

// GET /api/users/me

// GET /api/users/:username/routines

module.exports = router;
