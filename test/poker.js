const assert = require('assert')

const Server = require('../src/server')
const Player = require('../src/player')

const validConfigStart = () => {
  const server = new Server()

  const player1 = new Player()
  const player2 = new Player()
  const player3 = new Player()
  const player4 = new Player()
  const player5 = new Player()

  server.connect(player1)
  server.connect(player2)
  server.connect(player3)
  server.connect(player4)
  server.connect(player5)

  server.start()

  return [server, player1, player2, player3, player4, player5]
}

describe('poker', () => {
  describe('players', () => {
    it('minimum 4', () => {
      const server = new Server()

      const player1 = new Player()
      const player2 = new Player()
      const player3 = new Player()

      server.connect(player1)
      server.connect(player2)
      server.connect(player3)

      assert.throws(server.start.bind(server))
    })
    it('maximum 9', () => {
      const server = new Server()

      const player1 = new Player()
      const player2 = new Player()
      const player3 = new Player()
      const player4 = new Player()
      const player5 = new Player()
      const player6 = new Player()
      const player7 = new Player()
      const player8 = new Player()
      const player9 = new Player()
      const player10 = new Player()

      server.connect(player1)
      server.connect(player2)
      server.connect(player3)
      server.connect(player4)
      server.connect(player5)
      server.connect(player6)
      server.connect(player7)
      server.connect(player8)
      server.connect(player9)
      server.connect(player10)
  
      assert.throws(server.start.bind(server))
    })
    it('between 4 and 9', () => {
      const server = new Server()

      const player1 = new Player()
      const player2 = new Player()
      const player3 = new Player()
      const player4 = new Player()
      const player5 = new Player()

      server.connect(player1)
      server.connect(player2)
      server.connect(player3)
      server.connect(player4)
      server.connect(player5)

      assert.doesNotThrow(server.start.bind(server))
    })
    it('start gold coins equal 100', () => {
      const [server, player1, player2, player3, player4, player5] = validConfigStart()

      assert.equal(player1.money, 100)
      assert.equal(player2.money, 100)
      assert.equal(player3.money, 100)
      assert.equal(player4.money, 100)
      assert.equal(player5.money, 100)
    })
    it('blinds are working well', () => {
      const [server, player1, player2, player3, player4, player5] = validConfigStart()

      assert(player1.blind, 'button')
      assert(player2.blind, 'small')
      assert(player3.blind, 'big')
      assert(player4.blind, 'no')
      assert(player5.blind, 'no')
    })
  })
  describe('game', () => {
    it('shuffle cards', () => {
      const [server] = validConfigStart()

      const startCards = [...server.desk.cards]

      server.shuffle()

      const afterShuffleCards = [...server.desk.cards]

      assert.notDeepEqual(startCards, afterShuffleCards)
    })
    it('each person get 2 cards', () => {
      const [server, player1, player2, player3, player4, player5] = validConfigStart()

      server.giveFirstCards()

      assert.equal(player1.cards.length, 2)
      assert.equal(player2.cards.length, 2)
      assert.equal(player3.cards.length, 2)
      assert.equal(player4.cards.length, 2)
      assert.equal(player5.cards.length, 2)

      assert.equal(server.desk.cards.length, 52 - 2 * 5) // 52 cards in Desk minus 2 cards per Player
    })
    it('deny access to players data', () => {
      const [server] = validConfigStart()

      server.giveFirstCards()

      assert.equal(server.players, undefined)
    })
    it('deny access to desk', () => {
      const [server] = validConfigStart()

      server.giveFirstCards()

      assert.equal(server.desk, undefined)
    })
    describe('betting round', () => {
      it('init', () => {
        const [server] = validConfigStart()
  
        server.giveFirstCards()
  
        server.startBettingRound()

        const tableData = server.getTableData()

        const bigBlindPlayer = tableData.players.filter(p => p.blind === 'big')[0]
        const smallBlindPlayer = tableData.players.filter(p => p.blind === 'small')[0]
        const buttonBlindPlayer = tableData.players.filter(p => p.blind === 'button')[0]
        const noBlindPlayer = tableData.players.filter(p => p.blind === 'no')[0]

        assert.equal(
          bigBlindPlayer.money,
          tableData.options.startMoney - tableData.options.minimumBet
        )

        assert.equal(
          smallBlindPlayer.money,
          tableData.options.startMoney - tableData.options.minimumBet / 2
        )

        assert.equal(
          buttonBlindPlayer.money,
          tableData.options.startMoney
        )

        assert.equal(
          noBlindPlayer.money,
          tableData.options.startMoney
        )

        assert.equal(tableData.communityCards.length, 0)
      })
    })
    it('play', () => {
      const [server, player1, player2, player3, player4, player5] = validConfigStart()

      server.giveFirstCards()
      server.startBettingRound()

      // get first player action
      // deny actions from another player
      // all players should play
      player1.fold()
      player2.call()
      player3.check()
      player4.raise()
      player5.call()

      

    })
  })
})
