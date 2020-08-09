class Player {
    constructor(num, isBot = false) {
        this.hand = [];
        this.handImgs = [];
        this.points = 0;
        this.state = 'playing';
        this.name = 'player' + (num + 1).toString();
        if (isBot) { this.isBot = true; this.state = 'autoplaying'; }
        else { this.isBot = false; this.state = 'playing' };

        this.mainDivId = this.name + 'mainDivId';
        this.buttonsDivId = this.name + 'buttonsDivId'
        this.textDivId = this.name + 'textDivId'
        this.cardsDivId = this.name + 'cardsDivId';
        this.drawButtonId = this.name + 'drawId';
        this.passButtonId = this.name + 'passId';
        this.pointsSpanId = this.name + 'pointsSpanId';
        this.stateSpanId = this.name + 'stateSpanId';
        this.handSpanId = this.name + 'handSpanId';
        this.nameId = this.name + 'Id';

    }
}

class Game {
    constructor() {
        this.nonComputerPlayers = 2;
        this.playingVsComputer = false;
        this.startSingleButtonId = 'startSingleButtonId';
        this.startMultiButtonId = 'startMultiButtonId'
        this.mainMenuDivId = 'mainMenuDivId';
        this.restartDivId = 'restartDivId'
        this.restartButtonId = 'restartButtonId'
        this.drawMainMenu();
    }

    startGame(mode) {
        this.hideElement(this.mainMenuDivId);
        this.players = [];
        if (mode === 1) {
            this.players = [new Player(0), new Player(1, true)];
            this.playingVsComputer = true;
        }
        else {
            for (let number of [...Array(this.nonComputerPlayers).keys()]) {
                this.players.push(new Player(number));
            }
        }
        this.playerNumber = 0;
        this.currentPlayer = this.players[this.playerNumber];
        this.drawBoard();
        this.drawRestartMenu();
        this.showElement(this.currentPlayer.mainDivId);
        this.fetchDeck().then(() => { this.playerDrawsCard(2) });

    }

    restartGame() {
        this.hideElement(this.restartDivId);
        for (let player of this.players) {
            this.hideElement(player.mainDivId);
        }
        if (this.playingVsComputer) {
            this.players = [new Player(0), new Player(1, true)];
        }
        else {
            this.players = [];
            for (let number of [...Array(this.nonComputerPlayers).keys()]) {
                this.players.push(new Player(number));
            }
        }
        for (let player of this.players) {
            this.updatePlayerBoard(player)
        }
        this.playerNumber = 0;
        this.currentPlayer = this.players[this.playerNumber];
        this.showElement(this.currentPlayer.mainDivId);
        this.shuffleDeck().then(() => { this.playerDrawsCard(2) });
    }

    fetchDeck() {
        return fetch('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=2')
            .then(response => response.json())
            .then(({ deck_id }) => { this.deckID = deck_id; });
    }

    fetchCard(count) {
        return fetch(`https://deckofcardsapi.com/api/deck/${this.deckID}/draw/?count=${count}`)
            .then(response => response.json())
            .then(({ cards }) => {
                for (let card of cards) {
                    this.currentPlayer.hand.push(card.value);
                    this.currentPlayer.handImgs.push(card.image);
                };
            });
    }

    shuffleDeck() {
        return fetch(`https://deckofcardsapi.com/api/deck/${this.deckID}/shuffle/`);
    }

    updatePoints() {
        const converter = {
            "2": 2,
            "3": 3,
            "4": 4,
            "5": 5,
            "6": 6,
            "7": 7,
            "8": 8,
            "9": 9,
            "10": 10,
            "JACK": 2,
            "QUEEN": 3,
            "KING": 4,
            "ACE": 11
        };
        this.currentPlayer.points = this.currentPlayer.hand.map((element) => converter[element]).reduce((sum, element) => sum + element);
    }

    canSelectNextPlayer() {
        return this.playerNumber + 1 < this.players.length;
    }

    selectNextPlayer() {
        this.playerNumber += 1;
        this.currentPlayer = this.players[this.playerNumber];
        this.showElement(this.currentPlayer.mainDivId);
    }

    pickWinner() {
        let maxPoints = 0;
        for (let player of this.players) {
            if (player.state === 'pending' && player.points > maxPoints) {
                maxPoints = player.points;
                this.currentPlayer = player;
            }
        }
        this.currentPlayer.state = 'won';
    }

    checkIfEveryoneElseLost() {
        return this.players.filter(element => element.state !== 'lost').length === 1;
    }

    endGame() {
        for (let player of this.players) {
            if (player.state !== 'won') {
                player.state = 'lost';
            }
            this.updatePlayerBoard(player);
        }
        this.showElement(this.restartDivId);
        this.round += 1;
    }


    checkIfPlyerLost() {
        return this.currentPlayer.points > 21;
    }

    checkIfPlayerWon() {
        return this.currentPlayer.points === 21 || (this.currentPlayer.points === 22 && this.currentPlayer.hand.length === 2);
    }

    playerDrawsCard(count = 1) {
        this.fetchCard(count).then(() => {
            this.updatePoints();
            if (this.checkIfPlayerWon()) {
                this.currentPlayer.state = 'won'
                this.endGame();
            }
            else if (this.checkIfPlyerLost()) {
                this.currentPlayer.state = 'lost';
                this.updatePlayerBoard(this.currentPlayer);
                if (this.canSelectNextPlayer()) {
                    this.selectNextPlayer();
                    if (this.checkIfEveryoneElseLost()) {
                        this.currentPlayer.state = 'won';
                        this.endGame();
                    }
                    else if (this.currentPlayer.isBot) {
                        this.automaticBotPlay(2);
                    }
                    else {
                        this.playerDrawsCard(2);
                    }
                }
                else {
                    this.pickWinner();
                    this.endGame();
                }
            }
            else {
                this.updatePlayerBoard(this.currentPlayer);
            }
        });
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }


    automaticBotPlay(count) {
        this.fetchCard(count).then(() => {
            this.updatePoints();
            this.updatePlayerBoard(this.currentPlayer);
            this.sleep(1000).then(() => {
                if (this.checkIfPlyerLost()) {
                    this.players[0].state = 'won';
                    this.endGame();
                }

                else if (this.checkIfPlayerWon() || this.currentPlayer.points > this.players[0].points) {
                    this.currentPlayer.state = 'won'
                    this.endGame();
                }

                else {
                    this.automaticBotPlay(1);
                }
            });
        });
    }

    playerPasses() {
        this.currentPlayer.state = 'pending';
        this.updatePlayerBoard(this.currentPlayer);
        if (this.canSelectNextPlayer()) {
            this.selectNextPlayer();
            if (this.checkIfEveryoneElseLost()) {
                this.currentPlayer.state = 'won';
                this.endGame();
            }
            else if (this.currentPlayer.isBot) {
                this.automaticBotPlay(2);
            }
            else {
                this.playerDrawsCard(2);
            }
        }
        else {
            this.pickWinner();
            this.endGame();
        }
    }

    drawButton(text, func, id, parent) {
        const button = document.createElement('button');
        button.innerHTML = text;
        button.id = id;
        button.onclick = func;
        parent.appendChild(button);
    }
    drawRadio(func, id, name, parent, checked = false) {
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.id = id;
        radio.onclick = func;
        radio.name = name;
        radio.checked = checked;
        parent.appendChild(radio);
    }

    drawSpan(text, id, parent) {
        const span = document.createElement('span');
        span.id = id;
        span.innerHTML = text + '</br>';
        parent.appendChild(span);
    }
    drawImg(src, parent) {
        const img = document.createElement('IMG');
        img.src = src;
        img.style.zoom = '0.5';
        parent.appendChild(img);
    }

    drawDiv(id, parent) {
        const div = document.createElement('div');
        div.id = id;
        parent.appendChild(div);
    }


    drawBoard() {
        for (let player of this.players) {
            let mainDiv = document.createElement('div');
            mainDiv.id = player.mainDivId;
            let cardsDiv = document.createElement('div');
            cardsDiv.id = player.cardsDivId;
            let textDiv = document.createElement('div');
            textDiv.id = player.textDivId;
            let buttonsDiv = document.createElement('div');
            buttonsDiv.id = player.buttonsDivId;
            this.drawSpan(player.name, player.nameId, textDiv);
            //this.drawSpan(player.hand.join(' '), player.handSpanId, textDiv);
            this.drawSpan(`Points: ${player.points}`, player.pointsSpanId, textDiv);
            this.drawSpan(`State: ${player.state}`, player.stateSpanId, textDiv);
            this.drawButton('DRAW', this.playerDrawsCard.bind(this, 1), player.drawButtonId, buttonsDiv);
            this.drawButton('PASS', this.playerPasses.bind(this), player.passButtonId, buttonsDiv);
            mainDiv.appendChild(buttonsDiv);
            mainDiv.appendChild(textDiv);
            mainDiv.appendChild(cardsDiv);
            mainDiv.style.display = 'None';
            mainDiv.style.flexDirection = 'row';
            mainDiv.style.alignItems = 'center';
            textDiv.style.display = 'flex';
            textDiv.style.flexDirection = 'column';
            textDiv.style.alignContent = 'center';
            document.body.appendChild(mainDiv);
        }
    }

    drawMainMenu() {
        const mainMenuDiv = document.createElement('div');
        mainMenuDiv.id = this.mainMenuDivId;
        this.drawButton('Play with computer', this.startGame.bind(this, 1), this.startSingleButtonId, mainMenuDiv);
        this.drawButton('Play with friends', this.startGame.bind(this, 2), this.startMultiButtonId, mainMenuDiv);
        this.drawRadio(() => { this.nonComputerPlayers = 2; }, 'radio1', 'radio', mainMenuDiv, true);
        this.drawRadio(() => { this.nonComputerPlayers = 3; }, 'radio2', 'radio', mainMenuDiv);
        this.drawRadio(() => { this.nonComputerPlayers = 4; }, 'radio3', 'radio', mainMenuDiv);
        document.body.appendChild(mainMenuDiv);
    }

    drawRestartMenu() {
        const restartMenuDiv = document.createElement('div');
        restartMenuDiv.id = this.restartDivId;
        this.drawButton('Play Again', this.restartGame.bind(this), this.restartButtonId, restartMenuDiv);
        restartMenuDiv.style.display = 'None';
        document.body.appendChild(restartMenuDiv);

    }

    updatePlayerBoard(player) {

        //document.getElementById(player.handSpanId).innerHTML = player.hand.join(' ') + '</br>';
        document.getElementById(player.pointsSpanId).innerHTML = `Points: ${player.points}`;
        document.getElementById(player.stateSpanId).innerHTML = `State: ${player.state}`;
        const cards = document.getElementById(player.cardsDivId);
        cards.innerHTML = '';
        for (let img of player.handImgs) {
            this.drawImg(img, cards);
        }
        if (player.state === 'playing') {
            this.showElement(player.drawButtonId);
            this.showElement(player.passButtonId);
        }
        else {
            this.hideElement(player.drawButtonId);
            this.hideElement(player.passButtonId);
        }
    }

    hideElement(elementId) {
        document.getElementById(elementId).style.display = 'none';
    }

    showElement(elementId) {
        document.getElementById(elementId).style.display = 'flex';
    }
}



const game1 = new Game();

