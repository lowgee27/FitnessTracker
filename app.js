require("dotenv").config()
const express = require("express")
const server = express()
const cors = require('cors');
const router = require('./api');
const morgan = require('morgan');
const bodyParser = require('body-parser');

// Setup your Middleware and API Router here

server.use(morgan('dev'));

server.use(cors());

server.use(bodyParser.json());

server.use('/api', router);

server.get('*', (req, res) => {
      res.status(404).send({ error: '404 - not found', message: 'No route found for the requested path' })
})
// const errorHandler404 = ((error, req, res, next) => {
//       res.status(404)
//       res.send( { error: '404 - not found', message: 'No route found for the requested path' } )

// })
// server.use(errorHandler404)


module.exports = server;
