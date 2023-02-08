/* eslint-disable no-useless-catch */
const express = require("express");
const router = express.Router();
const { getUserByUsername,
      createUser,
      getPublicRoutinesByUser,
      getAllRoutinesByUser } = require("../db");
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;



// POST /api/users/register

router.post('/register', async (req, res, next) => {
//Get paramaeters needed for the route from the client
      const { username, password } = req.body;

      try {

//Check to see if user exists
            const _user = await getUserByUsername(username);

            if (_user) {
                  res.send({
                        error: 'UserExistsError',
                        message: 'User ' + username + ' is already taken.',
                        name: 'UserExistsError'
                  });
            }
//Check to see if password too short
            if (password.length < 8) {
                  res.send({
                        error: 'PasswordTooShortError',
                        message: 'Password Too Short!',
                        name: 'Password Too Short!'
                  });
            }
//If checks passed, create user
            const user = await createUser({ username, password });
//Add token, attaching id and username
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
//Get the user
            const user = await getUserByUsername(username);
//Check to see if user exists and password entered = existing user password
            if (user && user.password == password) {
//Add token, attaching id and username
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
//The token is stored in the "Authorization" header.  When it was created, 
//id and username were added.  Grab the token from the header, 
//split it get the payload section, and decode the payload, 
//using verify and the secret, to extract the id and username
            if (req.headers.authorization) {
                  const usertoken = req.headers.authorization;
                  const token = usertoken.split(' ');
                  const decoded = jwt.verify(token[1], JWT_SECRET);
//Send the decoded, logged in user info.  If not logged in, 
//send an error with the 401 status
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

router.get('/:username/routines', async (req, res, next) => {
//Get the parameters from the route to input into the functions
      const { username } = req.params;

      try {
//Get the logged in username from the token
            const usertoken = req.headers.authorization;
            const token = usertoken.split(' ');
            const decoded = jwt.verify(token[1], JWT_SECRET);
//Check if the username from the route matches the logged in username
//Run the function based whether user is logged in or not
            if (username === decoded.username) {
                  const routines = await getAllRoutinesByUser({ username });     
                  res.send(routines);
            } else {
                  const user = await getPublicRoutinesByUser({ username });
                  res.send(user);
            }

      } catch ({ name, message }) {
            next({ name, message })
      }

});


module.exports = router;
