function displayWinner(userCards, computerCards, gameDiv, buttonDiv){
  const computerScore = calculateScore(computerCards);
  const userScore = calculateScore(userCards);
  let result = document.createElement('p');

  if (userScore > 21){
    result.appendChild(document.createTextNode("You Lost!"));
  } else if (computerScore > 21) {
    result.appendChild(document.createTextNode("You Won!"));
  } else if (computerScore > userScore) {
    result.appendChild(document.createTextNode("You Lost!"));
  } else if (userScore > computerScore){
    result.appendChild(document.createTextNode("You Won!"));
  } else {
    result.appendChild(document.createTextNode("It's a draw!"));
  }

  gameDiv.replaceChild(document.createElement('div').appendChild(result), buttonDiv);
}

function isGameOver(userCards, computerCards){
  const userScore = calculateScore(userCards);
  const computerScore = calculateScore(computerCards);
  if (userScore >= 21 || computerScore >= 21){
    return true;
  }
  return false;
}

function computerMove(hand, deck, div){
  if (calculateScore(hand) < 17){
    hand.push(deck.shift());
    const cardImage = document.createElement('img');
    cardImage.setAttribute('src', '../card_back.png');
    div.appendChild(cardImage);
    return false
  }
  return true;

}

function displayCards(cards, div, hide){

  if (div.getAttribute('class') === "computer" && hide === true){
    cards.forEach((card) => {
      const cardImage = document.createElement('img');
      if (cards.indexOf(card) === 0){
        cardImage.setAttribute('src', '../PNG-cards-1.3/' + card);
      } else {
        cardImage.setAttribute('src', '../card_back.png');
      }
      div.appendChild(cardImage);
    });
  } else {
    cards.forEach((card) => {
      const cardImage = document.createElement('img');
      cardImage.setAttribute('src', '../PNG-cards-1.3/' + card);
      div.appendChild(cardImage);
    });
  }
}

function calculateScore(hand){
  let score = 0;
  let aces = 0;
  hand.forEach((card) => {
    const value = card.split("_")[0];
    if (value === "jack" || value === "queen" || value === "king"){
      score += 10;
    } else if (value === "ace"){
      aces++;
    } else {
      score += parseInt(value);
    }
  });

  if (aces === 1){
    if (score + 11 < 21){
      score += 11;
    } else {
      score ++;
    }
  } else if (aces >= 2){
    score += (aces - 1)
    if (score + 11 < 21){
      score += 11;
    } else {
      score++;
    }
  }

  return score;
}

function generateDeck(startValues){
  const suits = ["hearts", "diamonds", "spades", "clubs"];
  const cards = [];
  const topCards = [];

  for (let i = 0; i < startValues.length; i++){
    const suit = suits[Math.floor(Math.random() * 4)];
    if (startValues[i] === "A"){
      if (topCards.indexOf("ace_of_" + suit + ".png") > -1){
        i--;
      } else {
        topCards.push("ace_of_" + suit + ".png");
      }
    } else if (startValues[i] === "J"){
      if (topCards.indexOf("jack_of_" + suit + "2.png") > -1){
        i--;
      } else {
        topCards.push("jack_of_" + suit + "2.png");
      }
    } else if (startValues[i] === "Q"){
      if (topCards.indexOf("queen_of_" + suit + "2.png") > -1){
        i--;
      } else {
        topCards.push("queen_of_" + suit + "2.png");
      }
    } else if (startValues[i] === "K"){
      if (topCards.indexOf("king_of_" + suit + "2.png") > -1){
        i--;
      } else {
        topCards.push("king_of_" + suit + "2.png");
      }
    } else {
      if (topCards.indexOf(startValues[i] + "_of_" + suit + ".png") > -1){
        i--;
      } else {
        topCards.push(startValues[i] + "_of_" + suit + ".png");
      }
    }
  }

  for (let i = 1; i <= 52; i++){
    let card = "";
    if (i % 13 === 1){
      card = "ace_of_" + suits[Math.floor((i - 1) / 13)] + ".png";
    } else if (i % 13 === 11){
      card = "jack_of_" + suits[Math.floor((i - 1) / 13)] + "2.png";
    } else if (i % 13 === 12){
      card = "queen_of_" + suits[Math.floor((i - 1) / 13)] + "2.png";
    } else if (i % 13 === 0){
      card = "king_of_" + suits[Math.floor((i - 1) / 13)] + "2.png";
    } else {
      card = i % 13 + "_of_" + suits[Math.floor((i - 1) / 13)] + ".png";
    }

    if (topCards.indexOf(card) === - 1){
      cards.push(card);
    }
  }
  shuffle(cards);

  return topCards.concat(cards);
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function main(){
  const startValues = []
  const button = document.querySelector(".playBtn");
  button.addEventListener('click', function (event){
    event.preventDefault();
    const form = document.querySelector('div.start');
    if (form.style.display === "none"){
      form.style.display = "block";
    } else {
      form.style.display = "none";
    }
    document.getElementById('startValues').value.split(',').forEach((value) => {
      startValues.push(value);
    });

    let cards = generateDeck(startValues);
    const userCards = [];
    const computerCards = [];

    computerCards.push(cards.shift());
    userCards.push(cards.shift());
    computerCards.push(cards.shift());
    userCards.push(cards.shift());

    const gameElement = document.querySelector('.game')

    const computerScore = document.createElement('p');
    computerScore.appendChild(document.createTextNode("Computer Score - ?"));

    const computerDiv = document.createElement('div');
    computerDiv.setAttribute('class', 'computer');
    computerDiv.appendChild(computerScore);
    gameElement.appendChild(computerDiv);

    const userDiv = document.createElement('div');
    userDiv.setAttribute('class', 'user');
    gameElement.appendChild(userDiv);
    const userScore = document.createElement('p');
    userDiv.appendChild(userScore);
    userScore.appendChild(document.createTextNode("User Score - " + calculateScore(userCards)));

    const buttonDiv = document.createElement('div');
    buttonDiv.setAttribute('class', 'buttons');

    const stand = document.createElement('button');
    stand.setAttribute('type', 'button');
    stand.appendChild(document.createTextNode("Stand"));

    const hit = document.createElement('button');
    hit.setAttribute('type', 'button');
    hit.appendChild(document.createTextNode("Hit"));

    buttonDiv.appendChild(hit);
    buttonDiv.appendChild(stand);
    gameElement.appendChild(buttonDiv);
    displayCards(computerCards, computerDiv, true);
    displayCards(userCards, userDiv);

    let computerStanding = false;


    hit.addEventListener('click', function(event){
      const card = cards.shift();
      userCards.push(card);
      const cardImage = document.createElement('img');
      cardImage.setAttribute('src', '../PNG-cards-1.3/' + card);
      userDiv.appendChild(cardImage);

      userScore.replaceChild(document.createTextNode("User Score - " + calculateScore(userCards)), userScore.firstChild);
      if (isGameOver(userCards, computerCards)){
        for (let i = 1; i < computerDiv.childNodes.length; i++){
          computerDiv.childNodes[i].setAttribute('src', '../PNG-cards-1.3/' + computerCards[i-1]);
        }
        computerScore.replaceChild(document.createTextNode("Computer Score - " + calculateScore(computerCards)), computerScore.firstChild);

        displayWinner(userCards, computerCards, gameElement, buttonDiv);

      } else {
        computerStanding = computerMove(computerCards, cards, computerDiv);
        if (isGameOver(userCards, computerCards)){
          for (let i = 1; i < computerDiv.childNodes.length; i++){
            computerDiv.childNodes[i].setAttribute('src', '../PNG-cards-1.3/' + computerCards[i-1]);
          }
          computerScore.replaceChild(document.createTextNode("Computer Score - " + calculateScore(computerCards)), computerScore.firstChild);

          displayWinner(userCards, computerCards, gameElement, buttonDiv);
        }
      }
    });

    stand.addEventListener('click', function(event){
      if (computerStanding){
        displayWinner(userCards, computerCards, gameDiv, buttonDiv);
      } else {
        while(!computerMove(computerCards, cards, computerDiv)){}

        for (let i = 1; i < computerDiv.childNodes.length; i++){
          computerDiv.childNodes[i].setAttribute('src', '../PNG-cards-1.3/' + computerCards[i-1]);
        }
        computerScore.replaceChild(document.createTextNode("Computer Score - " + calculateScore(computerCards)), computerScore.firstChild);
        displayWinner(userCards, computerCards, gameElement, buttonDiv);

      }
    });
  });
}

document.addEventListener('DOMContentLoaded', main);
