// reaction.js - Reaction time test (5 rounds)

var reactionBox = document.getElementById('reaction-box');
var reactionRound = document.getElementById('reaction-round');
var reactionBest = document.getElementById('reaction-best');
var reactionTimes = document.getElementById('reaction-times');

// state can be: 'start', 'waiting', 'go', 'early', 'between'
var state = 'start';
var startTime = 0;
var waitTimer = null;
var results = [];

var oldBest = getScore('reaction');
if (oldBest !== undefined) reactionBest.textContent = oldBest + ' ms';

function setBox(cssClass, text) {
  reactionBox.className = cssClass;
  reactionBox.textContent = text;
}

// wait a random time (1.2 to 4.2 seconds) and then turn green
function startWaiting() {
  state = 'waiting';
  setBox('waiting', 'Wait for green...');
  var delay = 1200 + Math.random() * 3000;
  waitTimer = setTimeout(function () {
    state = 'go';
    startTime = performance.now();
    setBox('go', 'CLICK NOW!');
    beep(880, 0.08);
  }, delay);
}

function boxClicked() {
  if (state === 'start') {
    results = [];
    reactionTimes.innerHTML = '';
    reactionRound.textContent = 0;
    startWaiting();
  } else if (state === 'waiting') {
    // clicked before it turned green
    clearTimeout(waitTimer);
    state = 'early';
    setBox('early', 'Too early! Click to try again');
    beep(150, 0.25, 'sawtooth');
  } else if (state === 'early' || state === 'between') {
    startWaiting();
  } else if (state === 'go') {
    var time = Math.round(performance.now() - startTime);
    results.push(time);
    reactionRound.textContent = results.length;

    var chip = document.createElement('span');
    chip.textContent = time + ' ms';
    reactionTimes.appendChild(chip);

    if (results.length === 5) {
      finishReaction();
    } else {
      state = 'between';
      setBox('', time + ' ms. Click for the next round');
    }
  }
}

function finishReaction() {
  var total = 0;
  var fastest = results[0];
  for (var i = 0; i < results.length; i++) {
    total += results[i];
    if (results[i] < fastest) fastest = results[i];
  }
  var average = Math.round(total / results.length);

  var isBest = saveScore('reaction', fastest, true);
  if (isBest) reactionBest.textContent = fastest + ' ms';

  state = 'start';
  setBox('', 'Average: ' + average + ' ms. Fastest: ' + fastest + ' ms' +
         (isBest ? ' (new best!)' : '') + '. Click to play again');
  beep(1040, 0.3, 'triangle');
}

reactionBox.addEventListener('click', boxClicked);
