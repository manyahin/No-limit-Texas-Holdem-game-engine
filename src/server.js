
const Desk = require('./desk')

const Server = class {
  // private fields
  #players = []
  #desk
  
  constructor(options) {
    this.options = {
      ...{
        startMoney: 100,
        minimumBet: 2
      }, 
      ...options
    };
    this.#players = []
    this.#desk = new Desk()
    this.communityCards = []
  }
  start() {
    // console.log('poker server started')

    if (this.#players.length < 4 || this.#players.length > 9)
      throw new Error('The count of players should be between 4 and 9')

    this.setBlinds()

    return true;
  }
  connect(player) {
    this.#players.push(player)

    player.money = this.options.startMoney
  }
  setBlinds() {
    // todo: start from random player
    this.#players[0].blind = 'button'
    this.#players[1].blind = 'small'
    this.#players[2].blind = 'big'
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
  startBettingRound() {
    for (const player of this.#players) {
      if (player.blind === 'big') {
        player.money -= this.options.minimumBet
      }
      else if (player.blind === 'small') {
        player.money -= this.options.minimumBet / 2
      }
    }
  }
  // public interface, hide cards
  getTableData() {
    return {
      players: this.#players.map(({name, money, blind}) => ({name, money, blind})),
      options: this.options,
      communityCards: this.communityCards
    }
  }
}

module.exports = Server
