const Template = {};
let trash = [];
let stash = [];
let chooser;
let Streak = 0;
const ZeroTime = 10;
let time_between = ZeroTime;
let timeframe = 'year';
const nameList = {};
var CompanyMap = {};
var cardDeck = [];
const HistoricalMap = {
  yesterday: [],
  month: [],
  year: [],
};
const Game = {
  round: -1,
};
const last = {
  lose: 0,
  compliment: 0,
  insult: 0,
};
const phrases = {
  index: {},
  loseList: [
    'You drowned',
    'Beached whale',
    'We caught you',
    'Go Fish!',
  ],
  complimentList: [
    'That was easy',
    'Finally that loser stopped playing',
    "I'm really a catfish",
    "You're krilling it",
  ],
  insultList: [
    "Gee you're terrible at this!",
    "I can do better and I don't have hands",
    'Your finger must have slipped',
    'Stop smoking the seaweed',
    "My mom's a whale too",
    'You suck like my blowhole',
    'I wish I could drown',
  ],
};
const ev = EvDa();
//let cardDeck = [];
// const cardDeck = [
//   [['TWTR', 'Twitter'], ['SNAP', 'Snapchat']],
//   [['VZ', 'Verizon'], ['PLNT', 'Planet Fitness']],
//   [['DIS', 'Disney'], ['V', 'Visa']],
//   [['GRPN', 'Groupon'], ['WMT', 'Walmart']],
//   [['TSLA', 'Tesla'], ['PYPL', 'PayPal']],
//   [['AAPL', 'Apple'], ['MSFT', 'Microsoft']],
//   [['SNAP', 'Snapchat'], ['FB', 'Facebook']],
//   [['PEP', 'Pepsi'], ['KO', 'Coke']],
//   [['TSLA', 'Tesla'], ['XOM', 'Exxon Mobil']],
//   [['AMZN', 'Amazon'], ['WMT', 'Walmart']],

//   // Maybe not disney?
//   [['NFLX', 'Netflix'], ['DIS', 'Disney']],

//   // A better one for the goog would be nice.
//   [['GOOG', 'Google'], ['BIDU', 'Baidu']],
//   [['V', 'Visa'], ['PYPL', 'PayPal']],
//   [['PM', 'Philip Morris'], ['PLNT', 'Planet Fitness']],
// ];

function iter(what) {
  phrases.index[what] = (phrases.index[what] + 1) % phrases[what].length;
  return phrases[what][phrases.index[what]];
}

function render() {
  if (Streak > 0) {
    $('#win').append('<div class="plus">+1</div>');
    $('.plus').on('animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd', function () { $(this).css('display', 'none'); });
    $('#whale-speak').html(iter('complimentList'));
  } else {
    $('#lose').addClass('lose');
    $('.lose').on('animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd', function () { $(this).css('display', 'none'); });
    $('#whale-speak').html(iter('loseList'));
  }

  $('#streak-container').html(Streak);
}

function shuffle(array) {
  let m = array.length; let t; let
    i;

  // While there remain elements to shuffle…
  while (m) {
    // Pick a remaining element…
    i = Math.floor(Math.random() * m--);

    // And swap it with the current element.
    t = array[m];
    array[m] = array[i];
    array[i] = t;
  }

  return array;
}

function remove(tuple, set) {
  if (!set) {
    trash = remove(tuple, trash);
    stash = remove(tuple, stash);
  } else {
    return set.filter(row => row[0] !== tuple[0]);
  }
}

function add(tuple, set) {
  set.push(tuple);
  return set;
}

function win() {
  time_between *= 0.9;
  Streak++;
}
function lose(chosen, notchosen) {
  console.log(notchosen.gain, chosen.gain, Math.round((notchosen.gain / chosen.gain - 1) * 100));
  time_between = ZeroTime;
  Streak = 0;
}

function getHistMapIX(searchVal) {
  // Used to find HistoricalMap index containing selected stock ticker

  let histMapIX = 0;

  while (HistoricalMap[timeframe][histMapIX].findIndex(ix => ix === searchVal) === -1) {
    histMapIX++;
  }

  return histMapIX;
}

function pick(index, which) {
  // make sure they are out of the list
  const stash_ix = which;
  const trash_ix = (which + 1) % 2;

  const chosen = cardDeck[index].round[stash_ix];
  const notchosen = cardDeck[index].round[trash_ix];

  remove(chosen);
  remove(notchosen);

  return chosen.gain > notchosen.gain ? win() : lose(chosen, notchosen);
}

function relative_percent(what) {
  const rel = Math.round((1 - what) * 100 * 100);
  let str = (rel / 100).toFixed(2);
  if (rel > 0) {
    str = `+${str}`;
  }
  return `${str}%`;
}

function doPercent(what, percent) {
  percent += 1;
  console.log(what, percent, relative_percent(percent));
  $(`.performance.${what}`).html(relative_percent(percent));
}

function endGame() {
  $('#choice-container').html(
    Template.endgame(),
  );
  clearInterval(chooser);
  $('#timer').hide();
  const max = Math.max.apply(0, Object.values(HistoricalMap[timeframe]).map(a => a[2]));
  const min = Math.min.apply(0, Object.values(HistoricalMap[timeframe]).map(a => a[2]));

  for (const ticker in HistoricalMap[timeframe]) {
    const change = HistoricalMap[timeframe][ticker][2];
    const perc = 100 * (max - change) / (max - min);
    $(`.performance.${ticker}`).html(Math.round(perc / 10));
    HistoricalMap[timeframe][ticker][3] = Math.round(perc / 10);

    console.log(change, perc, max, min);
    $(`.perf-container.${ticker} .waves`).css('height', `${perc}%`);
    $(`.perf-container.${ticker} .performance`).css('bottom', 0`${0.25 + 0.5 * perc}%`);
  }

  const stashTotal = stash.reduce((ix, row) => HistoricalMap[timeframe][row[0]][3] + ix, 0);
  const trashTotal = trash.reduce((ix, row) => HistoricalMap[timeframe][row[0]][3] + ix, 0);
  $('.performance.stash').html(stashTotal);
  $('.performance.trash').html(trashTotal);
  $('.performance.final').html(stashTotal - trashTotal);
  Game.over = true;
  return false;
}

function choose(ix, which) {
  pick(ix, which);
  render();
  return nextRound();
}

function nextRound() {
  if (Game.over) {
    return false;
  }
  Game.round += 1;
  $("#term").html(cardDeck[Game.round].term + "?");

  if (Game.round >= cardDeck.length) {
    return endGame();
  }

  let timer_ix = parseFloat(time_between.toFixed(1));
  if (chooser) {
    clearInterval(chooser);
  }
  $('#counter').html(timer_ix);
  chooser = setInterval(() => {
    timer_ix--;
    $('#counter').html(timer_ix.toFixed(1));
    if (timer_ix < 0) {
      clearInterval(chooser);
      lose();
      render();
      return nextRound();
    }
  }, 1000);

  $('#choice-container').html(
    Template.choice({ ix: Game.round, choice: cardDeck[Game.round].round }),
  );
  return true;
}

function loadTemplates() {
  $('#template > *').each(function () {
    const id = this.id.slice(2);
    Template[id] = _.template(this.innerHTML);
    console.log(`>> template ${id}`);
  });
}

function get(url, cb) {
  const http = new XMLHttpRequest();

  // Gets hostname and removes port
  const hostname = document.location.host.replace(/:\d{4}/, '') || 'localhost';

  http.open('GET', `http://${hostname}:4001/${url}`, true);
  http.setRequestHeader('Content-type', 'application/json');

  http.onreadystatechange = function () {
    if (http.readyState === 4 && http.status === 200) {
      cb(http.responseText);
    }
  };
  http.send();
}

function getNames(cb) {
  const hostname = document.location.host.replace(/:\d{4}/, '') || 'localhost';


  fetch(`http://${hostname}:4001/names`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(Object.keys(nameList)),
  })
    .then(res => res.json())
    .then((data) => {
      data.forEach(row => { CompanyMap[row[0]] = row[1]; });
    })
    .then(cb);
}

function row2card(row){
  return {
    ticker: row[0],
    name: CompanyMap[row[0]],
    gain: row[3]
  };
}

function setupGame() { 
  ['decade','year','month','yesterday'].forEach(row => {
    var cards = HistoricalMap[row].slice();
    while(cards.length > 2) {
      cardDeck.push({
        round: shuffle([
          row2card(cards.shift()), 
          row2card(cards.pop())
        ]),
        term: row
      });
    }
  });
}

function getHistorical() {
  get('dates', (data) => {
    const res = JSON.parse(data);
    let ref = {};

    // get yesterday
    res.data.yesterday.forEach((row) => {
      console.log(row);
      let name = row[0];
      nameList[name] = true;
      const openClose = row.slice(1);
      openClose.push(openClose[1] / openClose[0]);
      ref[name] = openClose[1];
      HistoricalMap.yesterday.push([
        name, row.slice(1), openClose, openClose[1] / openClose[0],
      ]);
    });

    // get month
    ['decade', 'year', 'month'].forEach((unit) => {
      HistoricalMap[unit] = [];
      res.data[unit].forEach((row) => {
        let name = row[0];
        const openClose = row.slice(1);
        openClose.push(openClose[1] / openClose[0]);
        HistoricalMap[unit].push([
          name, row.slice(1), openClose, ref[name] / openClose[0],
        ]);
      });
    });

    self.a = [];
    ['yesterday', 'month', 'year', 'decade'].forEach((row) => {
      a.push(HistoricalMap[row].sort((a,b) => {
        return (b[3] - a[3]);
      }));
      console.log(row);
    });

    getNames(() => {
      setupGame();
      loadTemplates();
      shufflePhrases();
      nextRound();
      render();
    });
  });

  console.log('getHistorical: HistoricalMap', HistoricalMap);
}

function shufflePhrases() {
  for (const x in phrases) {
    phrases[x] = shuffle(phrases[x]);
    phrases.index[x] = 0;
  }
}

getHistorical();
