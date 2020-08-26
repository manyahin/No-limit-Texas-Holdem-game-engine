
const Desk = require('./desk')
const Hand = require('pokersolver').Hand

const Poker = class {
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
      players: {},
      pot: 0
    }
    this.communityCards = []
    this.currPlayerIdTurn = 0
    this.round = 'preflop'
    this.playerGen = this.getNextPlayer()
    this.gameStatus = 'play' // play, finish
    this.firstPlayerIndex = 0
  }
  start() {
    // console.log('poker server started')

    if (this.#players.length < 4 || this.#players.length > 9)
      throw new Error('The count of players should be between 4 and 9')

    this.gameStatus = 'play'

    return true;
  }
  restart() {
    if (this.gameStatus !== 'finish') {
      throw new Error(`Game not finished yet!`)
    }

    this.gameStatus = 'play'

    this.bets = {
      limit: 0,
      players: {},
      pot: 0
    }

    // rotate order of players
    this.firstPlayerIndex++

    this.playerGen = this.getNextPlayer(this.firstPlayerIndex)

    this.#players.map(p => {
      p.cards = []
      p.status = 'play'
      p.blind = 'no'
    })

    this.setBlinds()

    this.shuffle() && this.giveFirstCards()
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
      this.bets.pot += bet
    }

    const setBigBlind = (player) => {
      const bet = this.options.minBet
      player.blind = 'big'
      player.status = 'blind'
      player.money -= bet
      this.bets.players[player.id] = bet
      this.bets.pot += bet
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
  // generator
  * getNextPlayer(firstPlayerIndex = 0) {
    let index = firstPlayerIndex
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
  getPlayerCurrBet(playerId) {
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
  get formattedComunityCards() {
    return this.communityCards.map(c => {
      return `${c.name}${c.suit.slice(0, 1).toLowerCase()}`
    })
  }
  calculateResults() {
    const activePlayers = this.#players
      .filter(p => p.status !== 'fold')
      .map(p => ({ ...p, solvedHand: Hand.solve([...p.formattedCards, ...this.formattedComunityCards]) }))

    const winnerHand = Hand.winners(activePlayers.map(p => p.solvedHand))

    const winnerPlayer = activePlayers.filter(p => p.solvedHand.descr === winnerHand[0].descr)

    this.finishGame(winnerPlayer[0], winnerHand[0].descr)
  }
  finishGame(player, winComb = '') {
    this.gameStatus = 'finish'

    if (!winComb) {
      console.log(`Game finished, ${player.name} won ${this.bets.pot} gold`)
    }
    else {
      console.log(`Game finished, ${player.name} won ${this.bets.pot} gold with combination ${winComb}`)
    }
  }
  nextPlayer() {
    const currPlayer = this.playerGen.next().value

    this.currPlayerIdTurn = currPlayer.id

    const statuses = this.#players.map(p => p.status).filter(s => s !== 'fold')

    // one player left
    if (statuses.length === 1) {
      currPlayer.money += this.bets.pot
      return this.finishGame(currPlayer)
    }

    if (!statuses.includes('blind') && !statuses.includes('play')) {
      return this.nextRound()
    }
  }
  nextRound() {
    const resetPlayerStatus = () => this.#players
      .filter(p => p.status !== 'fold')
      .map(p => p.status = 'play')

    switch (this.round) {
      case 'preflop':
        this.round = 'flop'
        this.communityCards = this.#desk.draw(3)
        resetPlayerStatus()
        break
      case 'flop':
        this.round = 'turn'
        this.communityCards = [...this.communityCards, ...this.#desk.draw(1)]
        resetPlayerStatus()
        break
      case 'turn':
        this.round = 'river'
        this.communityCards = [...this.communityCards, ...this.#desk.draw(1)]
        resetPlayerStatus()
        break
      case 'river':
        this.calculateResults()
        break
    }
  }
  makeAction(actionName, playerId, amount) {
    const player = this.getPlayerById(playerId)
    let needToPay = 0

    if (this.currPlayerIdTurn !== player.id) {
      throw new Error('Action of wrong player')
    }

    // todo: deny actions to players with status 'fold'

    switch (actionName) {
      case 'fold':
        player.status = 'fold'
        break
      case 'call':
        needToPay = this.bets.limit - this.getPlayerCurrBet(playerId)

        this.validatePlayerBalance(playerId, needToPay)

        player.money -= needToPay
        player.status = 'call'

        this.bets.players[player.id] = this.getPlayerCurrBet(playerId) + needToPay
        this.bets.pot += needToPay

        break
      case 'check':
        player.status = 'check'
        break
      case 'raise':
        this.bets.limit = amount

        needToPay = this.bets.limit - this.getPlayerCurrBet(playerId)

        this.validatePlayerBalance(playerId, needToPay)

        player.money -= needToPay
        player.status = 'raise'

        this.bets.players[player.id] = this.getPlayerCurrBet(playerId) + needToPay
        this.bets.pot += needToPay

        break
    }

    this.nextPlayer()
  }
}

module.exports = Poker
