const ikea = require('ikea-name-generator');

const Player = class {
  constructor(name) {
    this.id
    this.name = name || ikea.getName()
    this.money = 0 // gold coins :)
    this.blind = 'no'
    this.cards = []
    this.server
    this.status // fold, play, call, blind
  }
  get formattedCards() {
    return this.cards.map(c => {
      return `${c.name}${c.suit.slice(0, 1).toLowerCase()}`
    })
  }
  fold() {
    this.server.makeAction('fold', this.id)
  }
  call() {
    this.server.makeAction('call', this.id)
  }
  check() {
    this.server.makeAction('check', this.id)
  }
  raise(amount) {
    this.server.makeAction('raise', this.id, amount)
  }
}

module.exports = Player
