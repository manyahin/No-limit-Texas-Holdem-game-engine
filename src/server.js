
const Desk = require('./desk')

const Server = class {
  // private fields
  #players = []
  #desk

  constructor(options) {
    this.options = {
      ...{
        startMoney: 100,
        minBet: 2
      },
      ...options
    };
    this.#players = []
    this.#desk = new Desk()

    this.bets = {
      limit: 0,
      players: {}
    }
    this.communityCards = []
    this.currPlayerIdTurn = 0
    this.round = 'preflop'
    this.playerGen = this.getNextPlayer()
  }
  start() {
    // console.log('poker server started')

    if (this.#players.length < 4 || this.#players.length > 9)
      throw new Error('The count of players should be between 4 and 9')

    return true;
  }
  connect(player) {
    this.#players.push(player)

    player.id = this.#players.length
    player.money = this.options.startMoney
    player.status = 'play'

    player.server = this
  }
  setBlinds() {
    const setButtonBlind = (player) => {
      player.blind = 'button'
      player.status = 'blind'
      this.bets.players[player.id] = 0
    }

    const setSmallBlind = (player) => {
      const bet = this.options.minBet / 2
      player.blind = 'small'
      player.status = 'blind'
      player.money -= bet
      this.bets.players[player.id] = bet
    }

    const setBigBlind = (player) => {
      const bet = this.options.minBet
      player.blind = 'big'
      player.status = 'blind'
      player.money -= bet
      this.bets.players[player.id] = bet
    }

    setButtonBlind.bind(this)(this.playerGen.next().value)
    setSmallBlind.bind(this)(this.playerGen.next().value)
    setBigBlind.bind(this)(this.playerGen.next().value)

    this.bets.limit = this.options.minBet
    this.currPlayerIdTurn = this.playerGen.next().value.id
  }
  // test methods, should not be used by players
  getDeskCards() {
    return this.#desk.cards
  }
  shuffle() {
    this.#desk.shuffle()
  }
  giveFirstCards() {
    this.shuffle()

    for (const player of this.#players) {
      player.cards = this.#desk.draw(2)
    }
  }
  * getNextPlayer() {
    let index = 0
    const calcIndex = () => (index + 1) % this.#players.length
    while (true) {
      const player = this.#players[index]
      if (player.status === 'fold') {
        index = calcIndex()
        continue
      }
      yield player
      index = calcIndex()
    }
  }
  getPlayerBet(playerId) {
    return this.bets.players[playerId] || 0
  }
  getPlayerById(playerId) {
    return this.#players.find(p => p.id === playerId)
  }
  validatePlayerBalance(playerId, requiredAmount) {
    const player = this.getPlayerById(playerId)
    if (player.money < requiredAmount) {
      throw new Error('Player dont have enought of money to do action')
    }
  }
  // public interface, hide cards
  getTableData() {
    return {
      players: this.#players
        .map(({ name, money, blind, status, id }) => ({ name, money, blind, status, id })),
      options: this.options,
      bets: this.bets,
      communityCards: this.communityCards,
      round: this.round
    }
  }
  nextPlayer() {
    this.currPlayerIdTurn = this.playerGen.next().value.id
    // todo: skip fold players

    const status = this.#players.map(p => p.status)
    if (!status.includes('blind') && !status.includes('play')) {
      return this.nextRound()
    }

    // todo: If only one player remains after a round he gets all the money in the pot and you deal another game

    // todo: If all the players Call the last raise without re-raising Move to next step.

    // if (this.round === 'preflop') {

    // }
  }
  nextRound() {
    switch (this.round) {
      case 'preflop':
        this.round = 'flop'
        this.communityCards = this.#desk.draw(3)
        break
      case 'flop':
        this.round = 'turn'
        this.communityCards = [...this.communityCards, ...this.#desk.draw(1)]
        break
      case 'turn':
        this.round = 'river'
        this.communityCards = [...this.communityCards, ...this.#desk.draw(1)]
        break
    }
  }
  makeAction(actionName, playerId, amount) {
    const player = this.getPlayerById(playerId)
    let needToPay = 0

    if (this.currPlayerIdTurn !== player.id) {
      throw new Error('Action of wrong player')
    }

    switch (actionName) {
      case 'fold':
        player.status = 'fold'
        break
      case 'call':
        needToPay = this.bets.limit - this.getPlayerBet(playerId)

        this.validatePlayerBalance(playerId, needToPay)

        player.money -= needToPay
        player.status = 'call'

        this.bets.players[player.id] = this.getPlayerBet(playerId) + needToPay

        break
      case 'check':

        break
      case 'raise':
        this.bets.limit = amount

        needToPay = this.bets.limit - this.getPlayerBet(playerId)

        this.validatePlayerBalance(playerId, needToPay)

        player.money -= needToPay
        player.status = 'raise'

        this.bets.players[player.id] = this.getPlayerBet(playerId) + needToPay

        break
    }

    this.nextPlayer()
  }
}

module.exports = Server
