const { app, server } = require('../src/http')
const request = require('supertest')
const assert = require('assert')

describe('http', () => {
  after(() => {
    server.close()
  })

  it('status', async () => {
    const res = await request(app).get('/status')

    assert.equal(res.text, '{"status":"done"}')
  })
  it('connect 1', async () => {
    const res = await request(app).post('/connect').send({name: 'Mikky'})

    assert.equal(res.text, '{"status":"done"}')
  })
  it('connect 2', async () => {
    const res = await request(app).post('/connect').send()

    assert.equal(res.text, '{"status":"done"}')
  })
  it('connect 3', async () => {
    const res = await request(app).post('/connect').send()

    assert.equal(res.text, '{"status":"done"}')
  })
  it('bad start', async () => {
    const res = await request(app).get('/start')

    assert.equal(res.body.status, 'error')
    assert.equal(res.body.message, 'The count of players should be between 4 and 9')
  })
  it('connect 4', async () => {
    const res = await request(app).post('/connect').send()

    assert.equal(res.text, '{"status":"done"}')
  })
  it('connect 5', async () => {
    const res = await request(app).post('/connect').send()

    assert.equal(res.text, '{"status":"done"}')
  })
  it('good start', async () => {
    const res = await request(app).get('/start')

    assert.equal(res.text, '{"status":"done"}')
  })
  it('table data', async () => {
    const res = await request(app).get('/table')

    assert.equal(res.body.players.length, 5)
  })
  it('action', async () => {
    const tableData = await request(app).get('/table')

    const res = await request(app).post('/action').send({
      actionName: 'call',
      playerId: tableData.body.currentPlayerId,
      amount: 0
    })

    assert.equal(res.text, '{"status":"done"}')
  })
})
