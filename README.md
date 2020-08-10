# blackjack

Simple game similar to Blackjack written in pure JavaScript. It supports two modes:
    - vsComputer: user plays versus bot
    - multiplayer: 2-4 players fight between each other

To play the game clone/download the project and run index.html file in your internet browser.

Project uses free API -> https://deckofcardsapi.com/. Whole game's logic relies on two objects: Game and Player. Shown below there is description of their properties and methods.

Player:

    constructor(num, isBot = false) -> takes Int, Boolean; num determines Player.name; isbot (default to false) determines Player.isBot;

    Player.hand -> Array; Array of Strings; represents players hand of cards;

    Player.handImgs -> Array; Array of Strings; holds links to images of cards in Player.hand;
    
    Player.points -> Int; holds current player's score

    Player.state -> String; one of ['playing', 'autoplaying', 'pending', 'won', 'lost']; used in game's logic to determinate next step

    Player.isBot -> Boolean; default false; determinates if player is controlled by computer;

    Player.name -> String; used to determine other properties;

    Player.mainDivId -> String; holds id of related HTML element;
    Player.buttonsDivId -> String; holds id of related HTML element;
    Player.textDivId -> String; holds id of related HTML element;
    Player.cardsDivId -> String; holds id of related HTML element;
    Player.drawButtonId -> String; holds id of related HTML element;
    Player.passButtonId -> String; holds id of related HTML element;
    Player.pointsSpanId -> String; holds id of related HTML element;
    Player.stateSpanId -> String; holds id of related HTML element;
    Player.handSpanId -> String; holds id of related HTML element;
    Player.nameId -> String; holds id of related HTML element;

Game:

    Game.nonComputerPlayers -> Int; number of non comupter players in game; set to 2 by default; player can change its value in main menu;
    
    Game.playingVsComputer -> Boolean, default to false; can be set to true by choosing playingVsComputer mode;

    Game.players -> Array; Array of Player Objects; initialized in Game.startGame();

    Game.playerNumber -> Int; used to set Game.currentPlayer; initialized in Game.startGame();

    Game.currentPlayer -> Player; holds a reference to currently chosen Player from Game.players; initialized in Game.startGame();

    Game.startSingleButtonId -> String; holds id of related HTML element;
    Game.startMultiButtonId -> String; holds id of related HTML element;
    Game.mainMenuDivId -> String; holds id of related HTML element;
    Game.restartDivId -> String; holds id of related HTML element;
    Game.restartButtonId -> String; holds id of related HTML element;

    Game.startGame(mode) -> takes Int; mode=1 sets game mode to vsComputer, any other number sets game mode to multiplayer; one of main game logic functions; initializes Game.players, Game.currenPlayer, Game.playerNumber, Game.playingVsComputer; uses other functions to: draw/update elements, show/update elements, fetch cards;

    Game.restartGame() -> works similar to Game.startGame, but takes no arguments (Game.playingVsComputer) is already set)

    Game.endGame() -> one of main game logic functions; updates all Player.state in Game.players; uses other functions to: show/hide/update html elements

    Game.playerDrawsCard(count) -> takes Int (number of cards to Fetch); one of main game logic functions; updates Game.currentPlayer.state; uses other functions to: switch players, fetch cards, end game;

    Game.playerPasses() -> similar to Game.playerDrawsCard but takes no argument(always fetches 2 cards);

    Game.automaticBotPlay(count) -> takes Int (number of cadrs to fetch); similar to Game.playerDrawsCard; function used by bot;

    Game.fetchCard(count) -> takes number(int); returns Promise; fetches number of cards from API basing on Game.deckId, updates Game.currentPlayer.hand and Game.currentPlayer.handImgs

    Game.fetchDeck() -> returns Promise; fetches a deck of cards from API, sets Game.deckID property

    Game.ShuffleDeck() -> returns Promise; shuffles current deck using API

    Game.updatePoints() -> updates Game.currentPlayer.points basing on Game.currenPlayer.hand;

    Game.canSelectNextPlayer() -> returns Boolean; checks if there is next player in Game.players;

    Game.selectNextPlayer() -> switches reference to the next player in Game.players

    Game.pickWinner() -> resolves the game basing on all Player.points and Player.state, in case when no winner emerges during players turns

    Game.checkIfEveryoneElseLost() -> return Boolean; checks whether Game.currentPlayer is the only one which didn't lose basing on all other Player.state in Game.players;

    Game.checkIfPlyerLost() -> returns Boolean; check whether Game.currentPlayer exceded point limit basing on Game.currentPlayer.points

    Game.checkIfPlayerWon() -> returns Boolean; check whether Game.currentPlayer hit point limit basing on Game.currentPlayer.points

    Game.sleep(x) -> takes Int; returns Promise; stops program execution for x miliseconds

    Game.updatePlayerBoard(player) -> take Player; updates board basing on Player.point, Player.hand, Player.handImgs, Player.name, Player.state; uses other functions to: draw/hide/show html elements;

    Game.drawBoard() -> creates HTML element basing on Game.currentPlayer; uses other functions to: draw/hide/show html elements;

    Gane.drawMainMenu() -> draws main menu section; uses other functions to: draw/hide/show html elements;

    Game.drawRestartMenu() -> draws restart menu section; uses other functions to: draw/hide/show html elements;

    Game.hideElement(elementId) -> takes String; hides html element based on elementId;

    Game.showElement(elementId) -> takes String; shows html element based on elementId;

    Game.drawButton(text, func, id, parent) -> takes String, Function, String, Object(html); creates html button, sets its id, sets it onclick function, places it on parent;










