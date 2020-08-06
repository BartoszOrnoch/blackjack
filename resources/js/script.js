class Player {
    constructor() {
        this.hand = [];
        this.points = 0;
        this.won = false;
        this.lost = false;
    }

    fetchCard(deckID, count) {
        this.deckID = deckID;
        return fetch(`https://deckofcardsapi.com/api/deck/${deckID}/draw/?count=${count}`)
            .then(response => response.json())
            .then(({ cards }) => {
                for (let card of cards) {
                    this.hand.push(card.value);
                    console.log(this.hand);
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
        console.log(this.hand);
        this.points = this.hand.map((element) => converter[element]).reduce((sum, element) => sum + element);
        console.log(this.points);
    }

    drawButton() {
        let buttonDraw = document.createElement('button');
        buttonDraw.innerHTML = 'DRAW';
        buttonDraw.onclick = () => {
            this.fetchCard(this.deckID, 1).then(() => { this.updatePoints(); this.drawHand() });
        }
        document.body.appendChild(buttonDraw);


    }

    drawHand() {
        let spanHand = document.createElement('span');
        let spanPoints = document.createElement('span');
        spanHand.innerHTML = this.hand.join(' ') + '</br>';
        spanPoints.innerHTML = `Points: ${this.points}</br>`;
        document.body.appendChild(spanHand);
        document.body.appendChild(spanPoints);
        this.drawButton();
    }
}

class Game {
    constructor() {
        this.player = new Player();
    }

    fetchDeck() {
        return fetch('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=2')
            .then(response => response.json())
            .then(({ deck_id }) => { this.deckID = deck_id; });
    }
}

const game1 = new Game();
game1.fetchDeck().then(() =>
    game1.player.fetchCard(game1.deckID, 4)).then(() => { game1.player.updatePoints(); game1.player.drawHand(); });






