'use strict'

const http = require('http')
const express = require('express')
const bodyParser = require('body-parser')

async function handleResponse (topicArn, req, res) {
  console.log('req.headers', req.headers)
  console.log('req.body', req.body)
}

module.exports = () => {
  const app = express()
  const topicArnBounce = {}
  const topicArnComplaint = {}

  app.use(bodyParser.json())
  app.use((req, res, next) => {
    // IMPORTANT, otherwise content-type is text for topic confirmation reponse, and body is emptys
    if (req.get('x-amz-sns-message-type')) {
      req.headers['content-type'] = 'application/json'
    }
    next()
  })

  app.post('/sns/handle-bounces', async (req, res, next) => {
    try {
      await handleResponse(topicArnBounce, req, res)

      res.status(200).json({
        success: true,
        message: 'Successfully received message'
      })
    } catch (err) {
      next(err)
    }
  })

  app.post('/sns/handle-complaints', async function(req, res, next) {
    try {
      handleResponse(topicArnComplaint, req, res)

      res.status(200).json({
        success: true,
        message: 'Successfully received message.'
      })
    } catch (err) {
      next(err)
    }
  })

  app.use((err, req, res, next) => {
    console.log(err)

    res.json({
      ok: true
    })
  })

  app.server = http.createServer(app)

  return app
}
