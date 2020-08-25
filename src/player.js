const ikea = require('ikea-name-generator');

const Player = class {
  constructor(name) {
    this.name = name || ikea.getName()
    this.money = 0 // gold coins :)
    this.blind = 'no'
    this.cards = []
  }
  fold() {

  }
  call() {

  }
  check() {

  }
  raise() {
    
  }
}

module.exports = Player
