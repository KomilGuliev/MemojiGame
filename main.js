
let cards = document.getElementsByClassName('card');
let arCards = Array.from(cards);
arCards.forEach(element => {
	element.addEventListener('click', e => {
		element.classList.toggle('active');
	});
});

function Card(emoji) {
	this.emoji = emoji;
	this.active = false;
	this.allowClick = true;

	this.createNode();
}
Card.prototype.createNode = function() {
	const markup = `
		<div class="card" data-item="%item--number%">
			<div class="card__side card__side--front">
				<span>${this.emoji}</span>
			</div>
			<div class="card__side card__side--back"></div>
		</div>`;
	this.markup = markup;
}


const gameCtrl = {
	gameFrameClass: '.cards',
	cardClass: '.card',
	activeClass: 'active',
	successClass: 'card__success',
	failClass: 'card__fail',
	timerId: 'game__timer',
	message: 'game__message',
	button: 'btn--play',
	popup: '.popup',
	processing: false,
	emojiSymbols: ['😸', '🐶', '🐻', '🐼', '🐹', '🐯'],
	init: function() {
		this.GF = document.querySelector(this.gameFrameClass);
		this.cards = this.emojiSymbols.map(emoji => new Card(emoji));
		this.cards = this.cards.concat(this.emojiSymbols.map(emoji => new Card(emoji)));
		this.timerNode = document.getElementById(this.timerId);
		this.messageNode = document.getElementsByClassName(this.message)[0];
		this.btnPlayNode = document.getElementsByClassName(this.button)[0];

		this.setEventListener();

		this.clearGameFrame();
		this.setRandom();
		this.addCards();
		this.setCardNodes();
		
	},
	reStart: function() {
		this.clearGameFrame();
		this.setRandom();
		this.cards.forEach((card, i) => {
			this.setCardActive(i, false);
			card.allowClick = true;
			card.node.dataset.item = i;
			card.node.classList.remove(this.successClass);
			//console.log(card.node);
		});
		this.setTimer();
		this.setNewCards();
		console.log(this.cards);
	},
	setNewCards: function() {
		this.cards.forEach(card => this.GF.appendChild(card.node));
	},
	addCards: function() {
		let markup = '';
		this.cards.forEach((card, i) => {
			markup+=card.markup;
		})
		this.GF.innerHTML = markup;
	},
	setCardNodes: function() {
		let nodes = Array.from(this.GF.querySelectorAll(this.cardClass));
		nodes.forEach((card, i) => {
			card.dataset.item = i;
			this.cards[i].node = card;
		});
	},
	clearGameFrame: function() {
		document.querySelector(this.gameFrameClass).innerHTML = '';
	},
	setEventListener: function() {
		this.GF.addEventListener('click', (e) => {
			const target = e.target.parentNode;
			if(target.classList.contains('card')) {
				if(!this.processing) {
					this.timerStart();
					this.processing = true;
				}

				let activeCards = [];
				this.cards.forEach((card, i) => {
					if(card.active && card.allowClick) {
						activeCards.push(i);
					}
				});

				let targetIndex = parseInt(target.dataset.item);
				if(activeCards.length > 1) {
					this.removeActivity();
					this.setCardActive(targetIndex, true);
				} else if(activeCards.length === 1 && targetIndex != activeCards[0]) {
					this.setCardActive(targetIndex, true);
					this.checkCards(targetIndex, activeCards[0]);
				} else {
					this.setCardActive(targetIndex, true);
				}

				let actives = this.cards.filter(card => card.active);
				if(actives.length >= this.cards.length) {
					this.stopTimer();
					this.setGameRes();
				}

			}
		}, true);

		this.btnPlayNode.addEventListener('click', (e) => {
			this.reStart();
			e.target.closest(this.popup).style.display = 'none';
		});
	},
	checkCards: function(card1, card2) {
		if(this.cards[card1].emoji === this.cards[card2].emoji) {
			this.cards[card1].allowClick = false;
			this.cards[card2].allowClick = false;

			this.cards[card1].node.classList.add(this.successClass);
			this.cards[card2].node.classList.add(this.successClass);
		} else {
			this.cards[card1].node.classList.add(this.failClass);
			this.cards[card2].node.classList.add(this.failClass);
		}
	},
	setCardActive: function(index, state) {
		if(state) {
			this.cards[index].node.classList.add(this.activeClass);
			this.cards[index].active = true;
		} else {
			this.cards[index].node.classList.remove(this.activeClass);
			this.cards[index].active = false;
		}
	},
	removeActivity: function() {
		this.cards.forEach((card, i) => {
			if(card.allowClick) {
				card.node.classList.remove(this.activeClass);
				card.node.classList.remove(this.failClass);
				this.cards[i].active = false;
			}
		})
	},
	setRandom: function() {
		function randomCard(a, b) {
			return Math.random() - 0.5;
		}

		this.cards.sort(randomCard);
	},
	clock: function clock() {
		this.timer--;
		let minutes = (this.timer - this.timer % 60)/60;
		minutes = minutes > 9 ? minutes : '0' + minutes;
		let seconds = this.timer % 60 > 9 ? this.timer % 60  : '0' + this.timer % 60;
		let markup = `${minutes}:${seconds}`;
		this.timerNode.textContent = markup;
	},
	setTimer: function() {
		this.timer = 61;
		this.clock();
	},
	timerStart: function() {
		this.timer = 60;

		this.timerID = setInterval(() => {
			if(this.timer !== 0) {
				this.clock();
			} else {
				this.setGameRes();
			}
		}, 1000);
	},
	setGameRes: function() {
		let notActiveCards = this.cards.filter(card => !card.active);
		
		this.messageNode.querySelector('.game__message--lose').style.display = 'none';
		this.messageNode.querySelector('.game__message--win').style.display = 'none';
		if(notActiveCards.length > 0) {
			//this.messageNode.textContent = 'You Lose';
			this.messageNode.querySelector('.game__message--lose').style.display = 'block';
			this.btnPlayNode.textContent = 'Try again';
		} else {
			//this.messageNode.textContent = 'You Win';
			this.messageNode.querySelector('.game__message--win').style.display = 'block';
			this.btnPlayNode.textContent = 'Play again';			
		}

		document.querySelector(this.popup).style.display = 'block';
	},
	stopTimer: function() {
		clearInterval(this.timerID);
		this.processing = false;
	}
}

gameCtrl.init();