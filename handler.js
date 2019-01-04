const serverless = require('serverless-http')
const app = require('./')
module.exports.handler = serverless(app)
