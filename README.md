# No limit Texas Holdem game engine

    npm install

## Structure

    src/poker - contain all poker table logic
    src/player = contain all player logic
    src/desk - contain desk logic
    test/poker - all poker tests
    test/http - all web server tests

## Tests

    npm test

Example Result:

```bash
http                                                         
  √ status                                                   
  √ connect 1                                                
  √ connect 2                                                
  √ connect 3                                                
  √ bad start                                                
  √ connect 4                                                
  √ connect 5                                                
  √ good start                                               
  √ table data                                               
                                                              
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
Game finished, gunihagsiy won 23 gold                          
Game finished, bushulmo won 23 gold                            
    √ one left and restart                                   
    √ flop, turn, river                                      
Game finished, pötiigpå won 162 gold with combination Pair, 7's
    √ full game with result                                  
                                                              
                                                              
26 passing (91ms)                                            
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
