var 
  Template = {},
  trash = [], 
  stash = [],
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

  console.log(list);
  list.forEach(function(row) {
    $(".performance."+ row).html("0%");
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

  console.log(stash_ix, trash_ix);
  stash = add(CompanyList[index][stash_ix], stash); 
  trash = add(CompanyList[index][trash_ix], trash); 
}

function load() {
}

function save() {
}

function reset() {
}

function endGame() {
  $("#choice-container").html(
    Template.endgame()
  );
}

function choose(ix, which) {
  pick(ix, which);
  nextRound();
  render();
}

function nextRound() {
  Game.round += 1;

  if(Game.round >= CompanyList.length) {
    return endGame();
  }

  $("#choice-container").html(
    Template.choice({ix: Game.round, choice: CompanyList[Game.round] })
  );
}

function loadTemplates() {
  $("#template > *").each(function(){
    var id = this.id.slice(2);
    Template[id] = _.template(this.innerHTML);
    console.log(">> template " + id);
  });
}


$(function(){
  loadTemplates();
  nextRound();
});

