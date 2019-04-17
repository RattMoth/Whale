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

if len(sys.argv) < 2:
  print("Login username required")
  sys.exit(0)

lib.login(sys.argv[1])
lib.historical(["AAPL","MSFT","SNAP","FB","PEP","KO","TSLA","XOM","AMZN","WMT","NFLX","DIS","GOOG","BIDU","V","PYPL","PM","PLNT"])

