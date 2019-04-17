#!/usr/bin/env python3
import redis
import urllib.request
import db
import json
import inspect
import time
import hashlib

r = redis.Redis(host='localhost', port=6379, db=0,charset="utf-8", decode_responses=True)

def showError(what):
  print("Error: {}".format(what))

def upgrade():
  db.upgrade()

def cache_get(url, force = False):
  key = "c:{}".format(hashlib.md5(url.encode('utf-8')).hexdigest())
  if not r.exists(key) or force:
    req  = urllib.request.Request(url)

    with urllib.request.urlopen(req) as response:
      r.set(key, response.read(), 60 * 60 * 12)

  return r.get(key)
  

def historical(stockList):
  # todo: move this key to some file
  key="DF0GV3M5L6N2IE5"
  for stock in stockList:
    url="https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol={}&apikey={}".format(stock, key)
    resraw  = cache_get(url)

    resjson = json.loads(resraw)
    if "Note" in resjson:
      resraw  = cache_get(url, True)
      resjson = json.loads(resraw)
      time.sleep(13)

    print(resjson)
  """
  duration = 60 * 24
  if data:
    for row in data['historicals']:
      db.insert('historical', {
        'ticker': instrument,
        'open': row['open_price'],
        'close': row['close_price'],
        'low': row['low_price'],
        'high': row['high_price'],
        'begin': row['begins_at'],
        'duration': duration
      })
  """
