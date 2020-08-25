# No limit Texas Holdem game engine

## Structure

    src/server - contain all server logic
    src/player = contain all player logic
    src/desk - contain desk logic
    test/poker - all tests

## Tests

    npm test

Example Result:

```bash
poker                                                                     
  players                                                                 
    √ minimum 4                                                           
    √ maximum 9                                                           
    √ between 4 and 9                                                     
    √ start gold coins equal 100                                          
    √ blinds are working well                                             
  game                                                                    
    √ shuffle cards                                                       
    √ each person get 2 cards                                             
    √ deny access to players data                                         
    √ deny access to desk                                                 
  play                                                                    
    √ wrong player turn                                                   
    √ init game                                                           
    √ not enough money                                                    
    √ call                                                                
    √ raise                                                               
Game finished, ruefamka won 23 gold                                         
Game finished, popfoh won 23 gold                                           
    √ one left and restart                                                
    √ flop, turn, river                                                   
Game finished, rufke won 162 gold with combination Full House, K's over 10's
    √ full game with result                                               
                                                                          
                                                                          
17 passing (27ms)
```                                      

## Used Libraries

__Desk__ to give and shuffle cards 
* https://www.npmjs.com/package/playing-cards-js

__PokerSolver__ to solve poker combinations
* https://www.npmjs.com/package/pokersolver

## Suits

    diamonds (♦)
    spades (♠)
    hearts (♥)
    clubs (♣)
