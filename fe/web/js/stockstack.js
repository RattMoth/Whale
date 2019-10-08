const Template = {};
let trash = [];
let stash = [];
let chooser;
let Streak = 0;
const ZeroTime = 10;
let time_between = ZeroTime;
let timeframe = 'year';
let nameList = {};
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
let CompanyList = [];
// const CompanyList = [
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
function lose() {
  time_between = ZeroTime;
  Streak = 0;
}
function pick(index, which) {
  // make sure they are out of the list
  remove(CompanyList[index][0]);
  remove(CompanyList[index][1]);

  const stash_ix = which;
  const trash_ix = (which + 1) % 2;

  const chosen = CompanyList[index][stash_ix][0];
  const not_chosen = CompanyList[index][trash_ix][0];

  if (HistoricalMap[timeframe][chosen][2] > HistoricalMap[timeframe][not_chosen][2]) {
    win();
  } else {
    lose();
  }
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

  // Increase difficulty to month
  if (Game.round === 3) {
    timeframe = 'month';
    $('#didBetter').html('Which stock did better last month?');
    console.log('timeframe changed to month');
  }

  // Increase difficulty to year
  if (Game.round === 6) {
    timeframe = 'yesterday';
    $('#didBetter').html('What about yesterday?');
    console.log('timeframe changed to yesterday');
  }

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
    .then(data => CompanyList = data)
    .then(cb);

  console.log('getNames: CompanyList', CompanyList);
}

function getHistorical() {
  get('dates', (data) => {
    const res = JSON.parse(data);

    // get yesterday
    res.data[0].forEach((row) => {
      nameList[row[0]] = true;
      const openClose = row.slice(1);
      openClose.push(openClose[1] / openClose[0]);
      HistoricalMap.yesterday.push([
        row[0], row.slice(1), openClose, openClose[1] / openClose[0]
      ]);
    });

    // get month
    res.data[1].forEach((row) => {
      nameList[row[0]] = true;
      const openClose = row.slice(1);
      openClose.push(openClose[1] / openClose[0]);
      HistoricalMap.month.push([
        row[0], row.slice(1), openClose, openClose[1] / openClose[0]
      ]);
    });

    // get year
    res.data[2].forEach((row) => {
      nameList[row[0]] = true;
      const openClose = row.slice(1);
      openClose.push(openClose[1] / openClose[0]);
      HistoricalMap.year.push([
        row[0], row.slice(1), openClose, openClose[1] / openClose[0]
      ]);
    });

    self.a = [];
    ['yesterday','month','year'].forEach(row => {
      a.push(HistoricalMap[row].sort(function(a,b) {
        return (b[3] - 1) - (a[3] - 1);
      }));
      console.log(row);
    });

    getNames(function(){
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
