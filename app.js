'use strict';

const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();

async function handleResponse (topicArn, req, res) {
  console.log('req.headers', req.headers)
  console.log('req.body', req.body)
}

module.exports = () => {
  const app = express();

  app.use(bodyParser.json());
  app.use((req, res, next) => {
    // IMPORTANT, otherwise content-type is text for topic confirmation reponse, and body is emptys
    if (req.get('x-amz-sns-message-type')) {
      req.headers['content-type'] = 'application/json';
    }
    next();
  });

  app.post('/sns/handle-bounces', async (req, res) => {
    try {
      await handleResponse(topicArnBounce, req, res);

      res.status(200).json({
        success: true,
        message: 'Successfully received message'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  });

  app.post('/sns/handle-complaints', async function(req, res) {
    try {
      handleResponse(topicArnComplaint, req, res);

      res.status(200).json({
        success: true,
        message: 'Successfully received message.'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  });


  app.server = http.createServer(app);

  return app;
};
