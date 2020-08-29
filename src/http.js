const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const server = require('http').createServer(app);

const port = 3000

const Poker = require('./poker')
const Player = require('./player')

const poker = new Poker()

app.use(bodyParser.json())

app.get('/status', (req, res) => {
  return res.send({ status: 'done' })
})

app.post('/connect', (req, res) => {
  const player = new Player(req.body)
  poker.connect(player)

  return res.send({ status: 'done' })
})

app.get('/start', (req, res) => {
  try {
    poker.start()
    poker.setBlinds()
    poker.giveFirstCards()
  }
  catch (err) {
    return res.send({ status: 'error', message: err.message })
  }

  return res.send({ status: 'done' })
})

app.get('/table', (req, res) => {
  return res.send(
    poker.getTableData()
  )
})

app.post('/action', (req, res) => {
  poker.makeAction(req.body.actionName, req.body.playerId, req.body.amount)
  
  return res.send({ status: 'done' })
})

server.listen(port, () => {
  console.log(`Poker app listening at http://localhost:${port}`)
})

module.exports = { app, server } 
