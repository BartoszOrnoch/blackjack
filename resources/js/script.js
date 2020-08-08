class Player {
    constructor(num, isBot = false) {
        this.hand = [];
        this.points = 0;
        this.name = 'player' + (num + 1).toString();
        this.state = 'playing';
        if (isBot) { this.isBot = true; } else { this.isBot = false; };
    }
}

class Game {
    constructor(numberOfPlayers) {
        this.players = [];
        if (numberOfPlayers === 1) {
            this.players = [new Player(0), new Player(1, true)];
        }
        else {
            for (let number of [...Array(numberOfPlayers).keys()]) {
                this.players.push(new Player(number));
            }
        }
        this.playerNumber = 0;
        this.currentPlayer = this.players[this.playerNumber];
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
                };
            });
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

    selectNextPlayer() {
        this.playerNumber += 1;
        if (this.playerNumber === this.players.length) {
            this.pickWinner();
            return false;
        }
        else if (this.checkIfEveryoneElseLost()) {
            this.currentPlayer = this.players[this.playerNumber];
            this.currentPlayer.state = 'won';
            this.drawPlayerBoard();
            return false;
        }
        else {
            this.currentPlayer = this.players[this.playerNumber];
            return true;
        }
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
        this.drawPlayerBoard();
        this.endGame();
    }

    checkIfEveryoneElseLost() {
        return this.players.filter(element => element.state !== 'lost').length === 1;
    }

    endGame() {

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
                console.log('wygrana');
                this.currentPlayer.state = 'won'
                this.drawPlayerBoard();
                this.endGame();
            }

            else if (this.checkIfPlyerLost()) {
                console.log('przegrana');
                this.currentPlayer.state = 'lost';
                this.drawPlayerBoard();
                if (this.selectNextPlayer()) {
                    if (this.currentPlayer.isBot) {
                        this.automaticBotPlay();
                    }
                    else {
                        this.playerDrawsCard(2);
                    }
                }
            }
            else {
                this.drawPlayerBoard();
            }
        });
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }


    automaticBotPlay() {
        this.fetchCard(1).then(() => {
            this.updatePoints();
            this.drawPlayerBoard();
            this.sleep(1000).then(() => {
                if (this.checkIfPlyerLost()) {
                    this.currentPlayer.state = 'lost'
                    this.currentPlayer = this.players[0];
                    this.drawPlayerBoard();
                }

                else if (this.checkIfPlayerWon() || this.currentPlayer.points > this.players[0].points) {
                    this.currentPlayer.state = 'won'
                    this.drawPlayerBoard();
                    this.endGame();
                }

                else {
                    this.automaticBotPlay();
                }
            });
        });
    }

    playerPasses() {
        this.currentPlayer.state = 'pending';
        this.drawPlayerBoard();
        if (this.selectNextPlayer()) {
            if (this.currentPlayer.isBot) {
                this.automaticBotPlay();
            }
            else {
                this.playerDrawsCard(2);
            }
        }
    }

    drawButton(text, func, id, parent) {
        let button = document.createElement('button');
        button.innerHTML = text;
        button.id = id;
        button.onclick = func;
        parent.appendChild(button);
    }

    drawSpan(text, id, parent) {
        let span = document.createElement('span');
        span.id = id;
        span.innerHTML = text + '</br>';
        parent.appendChild(span);
    }

    drawPlayerBoard() {
        let playerBoardDiv = document.getElementById(this.currentPlayer.name + 'boardId');
        if (playerBoardDiv) { playerBoardDiv.remove() };
        playerBoardDiv = document.createElement('div');
        playerBoardDiv.id = this.currentPlayer.name + 'boardId';

        if (this.currentPlayer.state === 'won') {
            this.drawSpan(this.currentPlayer.hand.join(' '), 'hand', playerBoardDiv);
            this.drawSpan(`Points: ${this.currentPlayer.points}`, 'points', playerBoardDiv)
            this.drawSpan('wygrana' + '</br>', 'playerstate', playerBoardDiv)
        }
        else if (this.currentPlayer.state === 'lost') {
            this.drawSpan(this.currentPlayer.hand.join(' '), 'hand', playerBoardDiv);
            this.drawSpan(`Points: ${this.currentPlayer.points}`, 'points', playerBoardDiv)
            this.drawSpan('przegrana' + '</br>', 'playerstate', playerBoardDiv)

        }
        else if (this.currentPlayer.state === 'playing') {
            this.drawSpan(this.currentPlayer.hand.join(' '), 'hand', playerBoardDiv);
            this.drawSpan(`Points: ${this.currentPlayer.points}`, 'points', playerBoardDiv)
            this.drawSpan('playing' + '</br>', 'playerstate', playerBoardDiv);
            this.drawButton('DRAW', this.playerDrawsCard.bind(this, 1), 'drawbutton', playerBoardDiv);
            this.drawButton('PASS', this.playerPasses.bind(this), 'passbutton', playerBoardDiv)
        }
        else if (this.currentPlayer.state === 'pending') {
            this.drawSpan(this.currentPlayer.hand.join(' '), 'hand', playerBoardDiv);
            this.drawSpan(`Points: ${this.currentPlayer.points}`, 'points', playerBoardDiv);
            this.drawSpan('pending' + '</br>', 'playerstate', playerBoardDiv)

        }
        document.body.appendChild(playerBoardDiv);
    }

    drawMainMenu() {
        this.drawButton('Play')
    }
}



const game1 = new Game(4);
game1.fetchDeck().then(() => { game1.playerDrawsCard(2) });

