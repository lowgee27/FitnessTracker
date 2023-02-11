/* eslint-disable no-useless-catch */
const express = require("express");
const router = express.Router();
// const jwt = require('jsonwebtoken');
// const { JWT_SECRET } = process.env;
const { getUserByUsername, createUser, getUser, getAllRoutinesByUser, getPublicRoutinesByUser } = require('../db');

// POST /api/users/register
router.post('/register', async (req, res, next) => {
    const { username, password } = req.body;

    try {
        const _user = await getUserByUsername(username);

        if (_user) {
            res.send({
                error: 'error',
                name: 'UserTaken',
                message: `User ${username} is already taken.`
            });
        }

        if (password.length < 8) {
            res.send({
                error: 'error',
                name: 'TooShortError',
                message: 'Password Too Short!',
            });
        }

        const user = await createUser({
            username,
            password
        });

        const jwt = require('jsonwebtoken')
        
        const token = jwt.sign({
            id: user.id,
            username,
        }, process.env.JWT_SECRET, {
            expiresIn: '1w'
        });

        res.send({
            message: `Thank you for signing up!`,
            token,
            user
        });
    } catch ({ name, message }) {
        next({ name, message })
    }
})

// POST /api/users/login
router.post('/login', async (req, res, next) => {
    const { username, password } = req.body;

    try {
        const user = await getUser({ username, password });

        if (user) {

            const jwt = require('jsonwebtoken');
            
            const token = jwt.sign({
                id: user.id,
                username: user.username
            }, process.env.JWT_SECRET, {
                expiresIn: '1w'
            })
            res.send({
                user,
                message: "you're logged in!",
                token
            })
        } else {
            res.send({
                name: 'LoginError',
                message: 'Username or password is incorrect'
            })
        }
    } catch ({ name, message }) {
        next({ name, message })
    }
})

// GET /api/users/me
router.get('/me', async (req, res, next) => {
    try {
        if (req.headers.authorization) {

            const jwt = require('jsonwebtoken');

            const { JWT_SECRET } = process.env;

            const userToken = req.headers.authorization;

            const token = userToken.split(' ');

            const decoded = jwt.verify(token[1], JWT_SECRET);

            res.send({
                id: decoded.id,
                username: decoded.username
            })
        } else {
            res.status(401).send({
                error: 'error',
                message: 'You must be logged in to perform this action',
                name: 'UnauthorizedError'
            })
        }
    } catch ({ name, message }) {
        next({ name, message })
    }
})

// GET /api/users/:username/routines
router.get('/:username/routines', async (req, res, next) => {
    try {
        const user = req.user;
        
        const username = req.params.username;

        if (username === user.username) {
            const routines = await getAllRoutinesByUser(user);

            res.send(routines);
        } else {
            const routines = await getPublicRoutinesByUser({ username });

            res.send(routines);
        }
    } catch (error) {
        next(error)
    }
})

module.exports = router;
