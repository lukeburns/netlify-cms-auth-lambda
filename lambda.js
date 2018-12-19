'use strict'
const serverless = require('aws-serverless-express')
const app = require('./app')
// const middle = require('aws-serverless-express/middleware')
// app.use(middle.eventContext()) // exposes req.apiGateway.event to express server, if needed
const server = serverless.createServer(app)

exports.handler = (event, context) => { serverless.proxy(server, event, context) }
