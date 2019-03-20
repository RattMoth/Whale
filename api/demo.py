#!/usr/bin/env python3
from Robinhood import Robinhood
import redis
import urllib
import time
import sys
import json
import pprint
import sys
import getpass
import lib

my_trader = Robinhood()
r = redis.Redis(host='localhost', port=6379, db=0,charset="utf-8", decode_responses=True)

def login(who):
  token = r.hget('auth', who)
  lib.user['email'] = who
  if not token:
    password = getpass.getpass()
    try:
      my_trader.login(username=who, password=password)

    except:
      print("Password incorrect. Please try again")
      login(who)

    token = my_trader.headers['Authorization']
    print("Gathering history")
    dividends()
    history()
    r.hset('auth', who, token)
  else:
    myid = r.hget('id', lib.user['email'])
    if myid:
      lib.user['id'] = myid
    my_trader.headers['Authorization'] = token

def getInstrument(url):
  key = url.split('/')[-2]
  res = r.hget('inst', key)
  if not res:
    req  = urllib.request.Request(url) 

    with urllib.request.urlopen(req) as response:
      res = response.read()
      r.hset('inst', key, res)

  return res

def inject(res):
  res['instrument'] = json.loads(getInstrument(res['instrument']))
  return res

def getquote(what):
  key = 's:{}'.format(what)
  res = r.get(key)
  if not res:
    res = json.dumps(my_trader.get_quote(what))
    r.set(key, res, 900)
  return json.loads(res)

def getuser(what):
  if 'id' not in lib.user:
    myid = r.hget('id', lib.user['email'])

    if not myid and 'account' in what:
      myid = what['account'].split('/')[-2]
      r.hset('id', lib.user['email'], myid)
    lib.user['id'] = myid

  return lib.user['id']

def dividends(data = False):
  print("Dividends")
  if not data:
    tradeList = my_trader.dividends()
  else:
    tradeList = data

  for trade in tradeList['results']:
    lib.insert('trades', {
      'user_id': getuser(trade),
      'side': 'dividend',
      'instrument': trade['instrument'].split('/')[-2],
      'quantity': trade['position'],
      'price': trade['rate'],
      'created': trade['paid_at'],
      'rbn_id': trade['id']
    })

  if tradeList['next']:
    data = my_trader.session.get(tradeList['next'])
    dividends(data.json())

def portfolio():
  pass

def history(data = False):
  if not data:
    tradeList = my_trader.order_history()
  else:
    tradeList = data

  for trade in tradeList['results']:
    for execution in trade['executions']:

      try:
        lib.insert('trades', {
          'user_id': getuser(trade),
          'side': trade['side'],
          'instrument': trade['instrument'].split('/')[-2],
          'quantity': execution['quantity'],
          'price': execution['price'],
          'created': execution['timestamp'],
          'rbn_id': execution['id']
        })
      except:
        return

    inject(trade)

    print("{} {:5s} {:6s}".format(trade['created_at'], trade['side'], trade['instrument']['symbol']))

  if tradeList['next']:
    data = my_trader.session.get(tradeList['next'])
    history(data.json())

def analyze():
  #history()

  res = lib.run('select side,count(*),sum(quantity*price) from trades where user_id = ? group by side',(lib.user['id'], )).fetchall()

  print(res)
  pass

def whoami():
  pprint.pprint(lib.user)


def positions():
  positionList = my_trader.positions()
  tickerList = []
  computed = 0
  for position in positionList['results']:
    position['instrument'] = json.loads(getInstrument(position['instrument']))
    if float(position['quantity']) > 0:
      symbol = position['instrument']['symbol']
      res = getquote(symbol)
      pprint.pprint(res)
      last_price = res['last_extended_hours_trade_price']
      if last_price is None:
        last_price = res['last_trade_price']

      computed += float(position['quantity']) * float(last_price)
      popularity = my_trader.get_popularity(symbol)
   
      print("{:30s} {:5s} {:5.0f} {:10} {}".format(position['instrument']['name'][:29], symbol, float(position['quantity']), last_price, popularity))

  return {'computed': computed, 'positions': positionList }

#lib.upgrade()

if len(sys.argv) < 2:
  print("Login username required")
  sys.exit(0)
login(sys.argv[1])

analyze()

while True:
  print("> ", end="")
  cmd = input()
  eval(cmd)()

#dividends()
#portfolio()

#history()
#portfolio()
#pprint.pprint(my_trader.order_history())
