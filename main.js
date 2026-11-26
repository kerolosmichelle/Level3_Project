// main.js - shared code: tabs, sound and saved scores

var soundOn = localStorage.getItem('arcadeSound') !== 'off';
var audio = null;

// ----- Sound -----
// Plays a short beep. type can be 'square', 'triangle' or 'sawtooth'
function beep(frequency, length, type) {
  if (!soundOn) return;
  if (audio === null) {
    audio = new (window.AudioContext || window.webkitAudioContext)();
  }
  var osc = audio.createOscillator();
  var volume = audio.createGain();
  osc.type = type || 'square';
  osc.frequency.value = frequency;
  volume.gain.value = 0.05;
  osc.connect(volume);
  volume.connect(audio.destination);
  osc.start();
  osc.stop(audio.currentTime + length);
}

var soundBtn = document.getElementById('sound-btn');

function showSoundText() {
  soundBtn.textContent = soundOn ? 'Sound: on' : 'Sound: off';
}

soundBtn.addEventListener('click', function () {
  soundOn = !soundOn;
  localStorage.setItem('arcadeSound', soundOn ? 'on' : 'off');
  showSoundText();
  beep(600, 0.1);
});
showSoundText();

// ----- Saved scores -----
function getScores() {
  var saved = localStorage.getItem('arcadeScores');
  if (saved === null) return {};
  return JSON.parse(saved);
}

function getScore(name) {
  return getScores()[name];
}

// Saves the score if it is better than the old one. Returns true if it is a new best.
// For games like Memory a lower number is better, so we pass lowerIsBetter = true
function saveScore(name, value, lowerIsBetter) {
  var scores = getScores();
  var old = scores[name];
  var isBetter = old === undefined || (lowerIsBetter ? value < old : value > old);
  if (isBetter) {
    scores[name] = value;
    localStorage.setItem('arcadeScores', JSON.stringify(scores));
    showScores();
  }
  return isBetter;
}

function showScores() {
  var list = [
    ['snake', 'Snake best score', ''],
    ['memory-easy', 'Memory easy: fewest moves', ''],
    ['memory-normal', 'Memory normal: fewest moves', ''],
    ['memory-hard', 'Memory hard: fewest moves', ''],
    ['xo-wins', 'Tic-Tac-Toe wins vs computer', ''],
    ['reaction', 'Fastest reaction', ' ms']
  ];
  var html = '';
  for (var i = 0; i < list.length; i++) {
    var value = getScore(list[i][0]);
    if (value === undefined) value = '-';
    else value = value + list[i][2];
    html += '<div class="score-card"><div class="number">' + value + '</div>' +
            '<div class="label">' + list[i][1] + '</div></div>';
  }
  document.getElementById('score-list').innerHTML = html;
}

document.getElementById('reset-scores').addEventListener('click', function () {
  if (confirm('Delete all saved scores?')) {
    localStorage.removeItem('arcadeScores');
    showScores();
  }
});
showScores();

// ----- Tabs -----
var tabs = document.querySelectorAll('.tab');
var currentGame = 'snake';

function showGame(name) {
  currentGame = name;
  for (var i = 0; i < tabs.length; i++) {
    var tabName = tabs[i].dataset.game;
    tabs[i].classList.toggle('active', tabName === name);
    document.getElementById('game-' + tabName).classList.toggle('hidden', tabName !== name);
  }
  // stop the snake when you leave its tab
  if (name !== 'snake') stopSnake();
}

for (var i = 0; i < tabs.length; i++) {
  tabs[i].addEventListener('click', function () {
    showGame(this.dataset.game);
  });
}
