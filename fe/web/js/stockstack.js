const Template = {};
let trash = [];
let stash = [];
let chooser;
let Streak = 0;
let ZeroTime = 3;
let time_between = ZeroTime;
let HistoricalMap = {};
let Game = {
  round: -1,
};
let last = {
  lose: 0,
  compliment: 0,
  insult: 0,
};
let phrases = {
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
let ev = EvDa();
let CompanyList = [
  [['AAPL', 'Apple'], ['MSFT', 'Microsoft']],
  [['SNAP', 'Snapchat'], ['FB', 'Facebook']],
  [['PEP', 'Pepsi'], ['KO', 'Coke']],
  [['TSLA', 'Tesla'], ['XOM', 'Exxon Mobil']],
  [['AMZN', 'Amazon'], ['WMT', 'Walmart']],

  // Maybe not disney?
  [['NFLX', 'Netflix'], ['DIS', 'Disney']],

  // A better one for the goog would be nice.
  [['GOOG', 'Google'], ['BIDU', 'Baidu']],
  [['V', 'Visa'], ['PYPL', 'PayPal']],
  [['PM', 'Philip Morris'], ['PLNT', 'Planet Fitness']],
];

function iter(what) {
  phrases.index[what] = (phrases.index[what] + 1) % phrases[what].length;
  return phrases[what][phrases.index[what]];
}

function render() {
  if (Streak > 0) {
    $('#win').append('<div>+1</div>');
    $('#whale-speak').html(iter('complimentList'));
  } else {
    $('#lose').addClass('lose');
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
    return set.filter((row) => row[0] !== tuple[0]);
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
function lose() {
  time_between = ZeroTime;
  Streak = 0;
}
function pick(index, which) {
  // make sure they are out of the list
  remove(CompanyList[index][0]);
  remove(CompanyList[index][1]);

  const
    stash_ix = which;
  let trash_ix = (which + 1) % 2;

  const
    chosen = CompanyList[index][stash_ix][0];
  let not_chosen = CompanyList[index][trash_ix][0];

  if (HistoricalMap[chosen] > HistoricalMap[not_chosen]) {
    win();
  } else {
    lose();
  }
}

function relative_percent(what) {
  const rel = Math.round((1 - what) * 100 * 100);
  let str = (rel / 100).toFixed(2);
  if (rel > 0) {
    str = `+${ str}`;
  }
  return `${str}%`;
}

function doPercent(what, percent) {
  percent += 1;
  console.log(what, percent, relative_percent(percent));
  $(`.performance.${  what}`).html(relative_percent(percent));
}

function endGame() {
  $('#choice-container').html(
    Template.endgame(),
  );
  clearInterval(chooser);
  $('#timer').hide();
  const max = Math.max.apply(0, Object.values(HistoricalMap).map(a => a[2]));
  const min = Math.min.apply(0, Object.values(HistoricalMap).map(a => a[2]));

  for (const ticker in HistoricalMap) {
    const change = HistoricalMap[ticker][2];
    const perc = 100 * (max - change) / (max - min);
    $(`.performance.${  ticker}`).html(Math.round(perc / 10));
    HistoricalMap[ticker][3] = Math.round(perc / 10);

    console.log(change, perc, max, min);
    $(`.perf-container.${  ticker  } .waves`).css('height', `${perc }%`);
    $(`.perf-container.${  ticker  } .performance`).css('bottom', 0`${0.25 + 0.5 * perc}%`);
  }

  const stashTotal = stash.reduce((ix, row) => HistoricalMap[row[0]][3] + ix, 0);
  const trashTotal = trash.reduce((ix, row) => HistoricalMap[row[0]][3] + ix, 0);
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

  if (Game.round >= CompanyList.length) {
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
    Template.choice({ ix: Game.round, choice: CompanyList[Game.round] }),
  );
  return true;
}

function loadTemplates() {
  $('#template > *').each(function () {
    const id = this.id.slice(2);
    Template[id] = _.template(this.innerHTML);
    console.log(`>> template ${  id}`);
  });
}

function get(url, cb) {
  const http = new XMLHttpRequest();

  // Gets hostname and removes port
  const hostname = document.location.host.replace(/:\d{4}/, '');

  http.open('GET', `http://${hostname}:4001/${url}`, true);
  http.setRequestHeader('Content-type', 'application/json');

  http.onreadystatechange = function () {
    if (http.readyState == 4 && http.status == 200) {
      cb(http.responseText);
    }
  };
  http.send();
}

function getYesterday() {
  get('yesterday', (data) => {
    let res = JSON.parse(data);
    res.data.forEach((row) => {
      let openClose = row.slice(1);
      openClose.push(openClose[1] / openClose[0]);
      HistoricalMap[row[0]] = openClose;
    });
    console.log(HistoricalMap);
  });
}

function shufflePhrases() {
  for (const x in phrases) {
    phrases[x] = shuffle(phrases[x]);
    phrases.index[x] = 0;
  }
}

$(() => {
  getYesterday();
  loadTemplates();
  shufflePhrases();
  nextRound();
  render();
});
