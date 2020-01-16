'use strict'

const http = require('http')
const express = require('express')
const bodyParser = require('body-parser')
const AWS = require('aws-sdk')

AWS.config.update({
  accessKeyId: process.env.AWS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_REGION
})

async function handleResponse (topicArn, req, res) {
  console.log('req.headers', req.headers)
  console.log('req.body', req.body)
}

module.exports = () => {
  const app = express()
  const sns = new AWS.SNS()

  const topicArnBounce = 'arn:aws:sns:us-west-2:765806996685:ses-bounces-topic-staging'
  const paramsTopicBounces = {
    Protocol: 'https',
    TopicArn: topicArnBounce,
    Endpoint: 'https://aws-sns-handler.herokuapp.com/sns/handle-bounces'
  }

  const topicArnComplaint = 'arn:aws:sns:us-west-2:765806996685:ses-complaints-topic-staging'
  const paramsTopicComplaints = {
    Protocol: 'https',
    TopicArn: topicArnComplaint,
    Endpoint: 'https://aws-sns-handler.herokuapp.com/sns/handle-complaints'
  }

  sns.subscribe(paramsTopicBounces, (error, data) => {
    if (error) throw new Error(`Unable to set up SNS subscription: ${error}`)
    console.log(`SNS subscription set up successfully: ${JSON.stringify(data)}`)
  })

  sns.subscribe(paramsTopicComplaints, (error, data) => {
    if (error) throw new Error(`Unable to set up SNS subscription: ${error}`)
    console.log(`SNS subscription set up successfully: ${JSON.stringify(data)}`)
  })

  app.use((req, res, next) => {
    // IMPORTANT, otherwise content-type is text for topic confirmation reponse, and body is emptys
    if (req.get('x-amz-sns-message-type')) {
      req.headers['content-type'] = 'application/json'
    }
    next()
  })
  app.use(bodyParser.json())

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
