var 
  Template = {},
  trash = [], 
  stash = [],
  chooser,
  HistoricalMap = {},
  Game = {
    round: -1
  },
  ev = EvDa(),
  CompanyList = [
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
    [['PM', 'Philip Morris'], ['PLNT', 'Planet Fitness']]
  ];

function whoami() {
}

function render() {
  var list = [];
  trash.forEach(function(row) {
    if(!row.rendered) {
      row.rendered = true;
      $("#trash").prepend(Template.stack({item: row}));
    }
  });
      
  stash.forEach(function(row) {
    if(!row.rendered) {
      row.rendered = true;
      $("#stash").prepend(Template.stack({item: row}));
    }
  });

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
  clearInterval(chooser);
  $("#timer").hide();
  let max = Math.max.apply(0, Object.values(HistoricalMap).map(a => a[2]));
  let min = Math.min.apply(0, Object.values(HistoricalMap).map(a => a[2]));

  for(var ticker in HistoricalMap) {
    let change = HistoricalMap[ticker][2];
    let perc = 100 * (max - change) / (max - min);
    $(".performance." + ticker).html(Math.round(perc/10));
    HistoricalMap[ticker][3] = Math.round(perc/10);

    console.log(change, perc, max, min);
    $(".perf-container." + ticker + ' .waves').css('height', perc + '%');
    $(".perf-container." + ticker + ' .performance').css('bottom', .25 + .5 * perc + '%');
  }

  let stashTotal = stash.reduce(function(ix, row) {
    return HistoricalMap[row[0]][3] + ix;
  }, 0);
  let trashTotal = trash.reduce(function(ix, row) {
    return HistoricalMap[row[0]][3] + ix;
  }, 0);
  $(".performance.stash").html(stashTotal);
  $(".performance.trash").html(trashTotal);
  $(".performance.final").html(stashTotal - trashTotal);
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

  var timer_ix = 5;
  if(chooser) {
    clearInterval(chooser);
  }
  $('#counter').html(timer_ix);
  chooser = setInterval(function(){
    timer_ix --;
    $('#counter').html(timer_ix);
    if(timer_ix == -1) {
      clearInterval(chooser);
      choose(Game.round, Math.round(Math.random()));
    }
  }, 1000);

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

  http.open('GET', 'http://' + document.location.host + ':4001/' + url, true);
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
  //setTimeout(autoplay, 500);
});

