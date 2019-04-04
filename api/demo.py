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

lib.upgrade()

lib.get_yesterday('ticker, open, close')
sys.exit(0)
#[print('"{}","{}",'.format(y[0][0], y[1][0]), end='') for y in l]
if len(sys.argv) < 2:
  print("Login username required")
  sys.exit(0)
lib.login(sys.argv[1])
lib.historical(["AAPL","MSFT","SNAP","FB","PEP","KO","TSLA","XOM","AMZN","WMT","NFLX","DIS","GOOG","BIDU","V","PYPL","PM","PLNT"])

#analyze()
#sys.exit(0)

while True:
  print("> ", end="")
  cmd = input()
  eval("lib." + cmd)()

#dividends()
#portfolio()

#portfolio()
#pprint.pprint(my_trader.order_history())
