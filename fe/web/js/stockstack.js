var 
  Template = {},
  trash = [], 
  stash = [],
  HistoricalMap = {},
  Game = {
    round: -1
  },
  ev = EvDa(),
  CompanyList = [
    [['AAPL', 'Apple Computers'], ['MSFT', 'Microsoft']],
    [['SNAP', 'Snapchat'], ['FB', 'Facebook']],
    [['PEP', 'Pepsi'], ['KO', 'Coke']],
    [['TSLA', 'Tesla'], ['XOM', 'Exxon Mobil']],
    [['AMZN', 'Amazon'], ['WMT', 'Walmart']],

    // Maybe not disney?
    [['NFLX', 'Netflix'], ['DIS', 'Disney']],
    
    // A better one for the goog would be nice.
    [['GOOG', 'Google'], ['BIDU', 'Baidu']],
    [['V', 'Visa'], ['PYPL', 'PayPal']],
    [['PM', 'Philip Morris'], ['PLNT', 'Planet Fitness']]
  ];

function whoami() {
}

function render() {
  var list = [];
  $("#trash").html(
    trash.map(function(row) {
      list.push(row[0]);
      return Template.stack({item: row});
    }).join(''));

  $("#stash").html(
    stash.map(function(row) {
      list.push(row[0]);
      return Template.stack({item: row});
    }).join(''));


}

function remove(tuple, set) {
  if(!set) {
    trash = remove(tuple, trash);
    stash = remove(tuple, stash);
  } else {
    return set.filter(function(row) {
      return row[0] !== tuple[0];
    });
  }
}

function add(tuple, set) {
  set.push(tuple);
  return set;
}

function pick(index, which) {
  // make sure they are out of the list
  remove(CompanyList[index][0]); 
  remove(CompanyList[index][1]); 

  var 
    stash_ix = which,
    trash_ix = (which + 1) % 2;

  stash = add(CompanyList[index][stash_ix], stash); 
  trash = add(CompanyList[index][trash_ix], trash); 
}

function load() {
}

function save() {
}

function reset() {
}

function relative_percent(what) {
  let rel = Math.round((1 - what) * 100 * 100);
  let str = (rel / 100).toFixed(2);
  if(rel > 0) {
    str  = '+' + str;
  }
  return str + "%";
}

function doPercent(what, percent) {
  percent += 1;
  console.log(what, percent, relative_percent(percent));
  $(".performance." + what).html(relative_percent(percent));
}

function endGame() {
  $("#choice-container").html(
    Template.endgame()
  );
  for(var ticker in HistoricalMap) {
    $(".performance." + ticker).html(relative_percent(HistoricalMap[ticker][2]));
  }
  let stashTotal = stash.reduce(function(ix, row) {
    return (1 - HistoricalMap[row[0]][2]) + ix;
  }, 0);
  let trashTotal = trash.reduce(function(ix, row) {
    return (1 - HistoricalMap[row[0]][2]) + ix;
  }, 0);
  doPercent('stash', stashTotal);
  doPercent('trash', trashTotal);
  doPercent('final', stashTotal - trashTotal);
  console.log(stashTotal);
  Game.over = true;
  return false;
}

function choose(ix, which) {
  pick(ix, which);
  render();
  return nextRound();
}

function nextRound() {
  if(Game.over) { 
    return false;
  }
  Game.round += 1;

  if(Game.round >= CompanyList.length) {
    return endGame();
  }

  $("#choice-container").html(
    Template.choice({ix: Game.round, choice: CompanyList[Game.round] })
  );
  return true;
}

function autoplay() {
  function guess() {
    return Math.round(Math.random());
  }
  while( choose(Game.round, guess()) );
}

function loadTemplates() {
  $("#template > *").each(function(){
    var id = this.id.slice(2);
    Template[id] = _.template(this.innerHTML);
    console.log(">> template " + id);
  });
}

function get(url, cb) {
  var http = new XMLHttpRequest();

  http.open('GET', 'http://localhost:4001/' + url, true);
  http.setRequestHeader('Content-type', 'application/json');

  http.onreadystatechange = function() {
    if(http.readyState == 4 && http.status == 200) {
      cb(http.responseText);
    }
  }
  http.send();
}

function getYesterday() {
  get('yesterday', function(data) {
    var res = JSON.parse(data);
    res.data.forEach(function(row) {
      let openClose = row.slice(1);
      openClose.push(openClose[1] / openClose[0]);
      HistoricalMap[row[0]] = openClose;
    });
    console.log(HistoricalMap);
  });
}


$(function(){
  getYesterday();
  loadTemplates();
  nextRound();
  setTimeout(autoplay, 500);
});

