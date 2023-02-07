/* eslint-disable no-useless-catch */
const express = require("express");
const router = express.Router();
const { getUserByUsername, createUser, getUser } = require("../db");
const jwt = require('jsonwebtoken');
const { reset } = require("nodemon");
const { JWT_SECRET } = process.env;

// router.use((req, res, next) => {
//       console.log("A request is being made to /users");
//       next();
// });

// POST /api/users/register

router.post('/register', async (req, res, next) => {
      const { username, password } = req.body;

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

router.post('/login', async (req, res, next) => {
      const { username, password } = req.body;

      try {
            const user = await getUserByUsername(username);

            if (user && user.password == password) {

                  const token = jwt.sign({
                        id: user.id,
                        username
                  }, process.env.JWT_SECRET, {
                        expiresIn: '1w'
                  });

                  res.send({ user, message: "you're logged in!", token });
            } else {
                  next({
                        name: 'IncorrectCredentialsError',
                        message: 'Username or password is incorrect'
                  });
            }

      } catch ({ name, message }) {
            next({ name, message })
      }
});

// GET /api/users/me

router.get('/me', async (req, res, next) => {

      try {
            if (req.headers.authorization) {
                  const usertoken = req.headers.authorization;
                  const token = usertoken.split(' ');
                  const decoded = jwt.verify(token[1], JWT_SECRET);
                  console.log(decoded);
                  res.send({
                        id: decoded.id, username: decoded.username
                  });
            } else {
                  res.status(401)
                  res.send({
                        error: 'GetMeError', name: '401', message: 'You must be logged in to perform this action'

                  });
            }

      } catch ({ name, message }) {
            next({ name, message })
      }


});

// GET /api/users/:username/routines

module.exports = router;
