#!/usr/bin/env python3
import urllib.request
import db
import json
import time
import hashlib
import lib
import sys

# todo: move this key to some file
key = "DF0GV3M5L6N2IE5"
last = time.time()

def historical(stockList):
  global last
  ix = 0
  ttl = 3 * len(stockList)
  for name,duration in [('MONTHLY', 365.25/12), ('DAILY', 1), ('WEEKLY',7)]:
    duration *= (60 * 24) 
    for stock in stockList:
      print("{:.3f} {} {} ".format(ix / ttl, name, stock))
      ix += 1
      url = "https://www.alphavantage.co/query?function=TIME_SERIES_{}_ADJUSTED&symbol={}&apikey={}".format(name, stock, key)
      resraw = lib.cache_get(url, wait_until = last + 20)
      last = time.time()

      resjson = json.loads(resraw)
      if "Note" in resjson:
        print("<< Note: {} >>".format(url))

        resraw  = lib.cache_get(url, force = True, wait_until = last + 20)
        last = time.time()
        resjson = json.loads(resraw)

      for k,v in resjson.items():
        if k == 'Meta Data':
          continue

        try:
          for date,row in v.items():
            db.insert('historical', {
              'ticker': stock,
              'open': row['1. open'],
              'high': row['2. high'],
              'low': row['3. low'],
              'close': row['4. close'],
              'begin': date,
              'duration': duration
            })
        except:
          print(k,v)
