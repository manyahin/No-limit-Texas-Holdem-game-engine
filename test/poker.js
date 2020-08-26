const assert = require('assert')

const Poker = require('../src/poker')
const Player = require('../src/player')

const validConfigStart = () => {
  const poker = new Poker()

  const player1 = new Player()
  const player2 = new Player()
  const player3 = new Player()
  const player4 = new Player()
  const player5 = new Player()

  poker.connect(player1)
  poker.connect(player2)
  poker.connect(player3)
  poker.connect(player4)
  poker.connect(player5)

  poker.start()

  return [poker, player1, player2, player3, player4, player5]
}

describe('poker', () => {
  describe('players', () => {
    it('minimum 4', () => {
      const poker = new Poker()

      const player1 = new Player()
      const player2 = new Player()
      const player3 = new Player()

      poker.connect(player1)
      poker.connect(player2)
      poker.connect(player3)

      assert.throws(poker.start.bind(poker), /The count of players should be between 4 and 9/)
    })
    it('maximum 9', () => {
      const poker = new Poker()

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

      poker.connect(player1)
      poker.connect(player2)
      poker.connect(player3)
      poker.connect(player4)
      poker.connect(player5)
      poker.connect(player6)
      poker.connect(player7)
      poker.connect(player8)
      poker.connect(player9)
      poker.connect(player10)

      assert.throws(poker.start.bind(poker), /The count of players should be between 4 and 9/)
    })
    it('between 4 and 9', () => {
      const poker = new Poker()

      const player1 = new Player()
      const player2 = new Player()
      const player3 = new Player()
      const player4 = new Player()
      const player5 = new Player()

      poker.connect(player1)
      poker.connect(player2)
      poker.connect(player3)
      poker.connect(player4)
      poker.connect(player5)

      assert.doesNotThrow(poker.start.bind(poker))
    })
    it('start gold coins equal 100', () => {
      const [poker, player1, player2, player3, player4, player5] = validConfigStart()

      assert.equal(player1.money, 100)
      assert.equal(player2.money, 100)
      assert.equal(player3.money, 100)
      assert.equal(player4.money, 100)
      assert.equal(player5.money, 100)
    })
    it('blinds are working well', () => {
      const [poker, player1, player2, player3, player4, player5] = validConfigStart()

      poker.setBlinds()

      assert(player1.blind, 'button')
      assert(player2.blind, 'small')
      assert(player3.blind, 'big')
      assert(player4.blind, 'no')
      assert(player5.blind, 'no')
    })
  })
  describe('game', () => {
    it('shuffle cards', () => {
      const [poker] = validConfigStart()

      const startCards = [...poker.getDeskCards()]

      poker.shuffle()

      const afterShuffleCards = [...poker.getDeskCards()]

      assert.notDeepEqual(startCards, afterShuffleCards)
    })
    it('each person get 2 cards', () => {
      const [poker, player1, player2, player3, player4, player5] = validConfigStart()

      poker.giveFirstCards()

      assert.equal(player1.cards.length, 2)
      assert.equal(player2.cards.length, 2)
      assert.equal(player3.cards.length, 2)
      assert.equal(player4.cards.length, 2)
      assert.equal(player5.cards.length, 2)

      assert.equal(poker.getDeskCards().length, 52 - 2 * 5) // 52 cards in Desk minus 2 cards per Player
    })
    it('deny access to players data', () => {
      const [poker] = validConfigStart()

      poker.giveFirstCards()

      assert.equal(poker.players, undefined)
    })
    it('deny access to desk', () => {
      const [poker] = validConfigStart()

      poker.giveFirstCards()

      assert.equal(poker.desk, undefined)
    })
  })
  describe('play', () => {
    it('wrong player turn', () => {
      const [poker, player1, player2, player3, player4, player5] = validConfigStart()
      //    [..,     button,  small,   big,     raise (F),   fold   ]
      // (F) - First player to play

      poker.setBlinds()
      poker.giveFirstCards()

      assert.throws(() => {
        // player 4 must to do action
        player5.fold()
      }, /Action of wrong player/)
    })
    it('init game', () => {
      const [poker] = validConfigStart()

      poker.setBlinds()
      poker.giveFirstCards()

      const tableData = poker.getTableData()

      const bigBlindPlayer = tableData.players.filter(p => p.blind === 'big')[0]
      const smallBlindPlayer = tableData.players.filter(p => p.blind === 'small')[0]
      const buttonBlindPlayer = tableData.players.filter(p => p.blind === 'button')[0]
      const noBlindPlayer = tableData.players.filter(p => p.blind === 'no')[0]

      assert.equal(
        bigBlindPlayer.money,
        tableData.options.startMoney - tableData.options.minBet
      )

      assert.equal(
        smallBlindPlayer.money,
        tableData.options.startMoney - tableData.options.minBet / 2
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
    it('not enough money', () => {
      const [poker, player1, player2, player3, player4, player5] = validConfigStart()

      poker.setBlinds()
      poker.giveFirstCards()

      assert.throws(() => {
        player4.raise(120)
      }, /Player dont have enought of money to do action/)
    })
    it('call', () => {
      const [poker, player1, player2, player3, player4, player5] = validConfigStart()
      //    [..,     button,  small,   big,     raise (F),   fold   ]

      poker.setBlinds()
      poker.giveFirstCards()

      player4.fold()
      player5.call()

      player1.call()
      player2.call()
      player3.call()

      assert.equal(player1.money, 98)
      assert.equal(player2.money, 98)
      assert.equal(player3.money, 98)
      assert.equal(player4.money, 100)
      assert.equal(player5.money, 98)

      assert.equal(poker.round, 'flop')

      assert.equal(poker.communityCards.length, 3)
    })
    it('raise', () => {
      const [poker, player1, player2, player3, player4, player5] = validConfigStart()
      //    [..,     button,  small,   big,     raise (F),   fold   ]
      //    [..,     raise,   fold,    call,    fold,    fold   ]

      poker.setBlinds()
      poker.giveFirstCards()

      player4.raise(20)
      player5.fold()

      player1.raise(40)
      player2.fold()
      player3.call()

      player4.call()

      assert.equal(player1.money, 60)
      assert.equal(player2.money, 99)
      assert.equal(player3.money, 60)
      assert.equal(player4.money, 60)
      assert.equal(player5.money, 100)

      assert.equal(poker.round, 'flop')

      assert.equal(poker.communityCards.length, 3)
    })
    it('one left and restart', () => {
      const [poker, player1, player2, player3, player4, player5] = validConfigStart()
      //    [..,     button,  small,   big,     raise (F),   fold   ]
      //    [..,     fold,    fold,    fold,    raise,   fold   ]

      poker.setBlinds()
      poker.giveFirstCards()

      player4.raise(20)
      player5.fold()

      player1.fold()
      player2.fold()
      player3.fold()

      assert.equal(player1.money, 100)
      assert.equal(player2.money, 99)
      assert.equal(player3.money, 98)
      assert.equal(player4.money, 103)
      assert.equal(player5.money, 100)

      assert.equal(poker.communityCards.length, 0)

      poker.restart()
      //    [..,     fold,  button,      small,   big,    fold   ]
      //    [..,     fold,  raise(20),   fold,    fold,   fold (F)  ]

      player5.fold()
      player1.fold()
      player2.raise(20)
      player3.fold()
      player4.fold()

      assert.equal(player1.money, 100)
      assert.equal(player2.money, 102)
      assert.equal(player3.money, 97)
      assert.equal(player4.money, 101)
      assert.equal(player5.money, 100)

      assert.equal(poker.communityCards.length, 0)
    })
    it('flop, turn, river', () => {
      const [poker, player1, player2, player3, player4, player5] = validConfigStart()
      //    [..,     button,  small,   big,     call (F),  call ]

      poker.setBlinds()
      poker.giveFirstCards()

      player4.call()
      player5.call()
      player1.call()
      player2.call()
      player3.check()

      assert.equal(poker.communityCards.length, 3)

      player4.raise(20)
      player5.call()
      player1.call()
      player2.call()
      player3.fold()

      assert.equal(poker.communityCards.length, 4)

      player4.raise(40)
      player5.call()
      player1.fold()
      player2.fold()

      assert.equal(poker.communityCards.length, 5)

      assert.equal(poker.gameStatus, 'play')
    })
    it('full game with result', () => {
      const [poker, player1, player2, player3, player4, player5] = validConfigStart()
      //    [..,     button,  small,   big,     call (F),  call ]

      poker.setBlinds()
      poker.giveFirstCards()

      player4.call()
      player5.call()
      player1.call()
      player2.call()
      player3.check()

      assert.equal(poker.communityCards.length, 3)

      player4.raise(20)
      player5.call()
      player1.call()
      player2.call()
      player3.fold()

      assert.equal(poker.communityCards.length, 4)

      player4.raise(40)
      player5.call()
      player1.fold()
      player2.fold()

      assert.equal(poker.communityCards.length, 5)

      player4.raise(60) // all in!
      player5.call()

      assert.equal(poker.gameStatus, 'finish')
    })
  })
})
