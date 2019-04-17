#!/usr/bin/env python3
import redis
import urllib
import time
import json
import pprint
import sys
import db

my_trader = Robinhood()
r = redis.Redis(host='localhost', port=6379, db=0,charset="utf-8", decode_responses=True)

def showError(what):
  print("Error: {}".format(what))

def upgrade():
  db.upgrade()


