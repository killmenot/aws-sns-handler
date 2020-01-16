'use strict'

require('dotenv').config()

const app = require('./app')()
const port = normalizePort(process.env.PORT || 3000)

app.set('port', port)
app.server.listen(port)
app.server.on('error', onError)
app.server.on('listening', onListening)

function normalizePort(val) {
  const port = parseInt(val, 10)

  if (isNaN(port)) {
    // named pipe
    return val
  }

  if (port >= 0) {
    // port number
    return port
  }

  return false
}

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error
  }

  /* jshint laxbreak: true */
  const bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges')
      process.exit(1)

    case 'EADDRINUSE':
      console.error(bind + ' is already in use')
      process.exit(1)

    default:
      throw error
  }
}

function onListening() {
  var { port } = app.server.address()
  console.log('----------------------------------------------------')
  console.log('Express app listening on port %d', port)
  console.log('Env. NODE_ENV: ' + process.env.NODE_ENV)
  console.log('Build time: ' + new Date())
}

function die(event, err) {
  console.error('server|error - message:' + err.message)
  console.error('server|error - stack:' + err.stack)
  setTimeout(() => process.exit(1), 0)
}

process.on('uncaughtException', die.bind(null, 'uncaughtException'))
process.on('unhandledRejection', die.bind(null, 'unhandledRejection'))
