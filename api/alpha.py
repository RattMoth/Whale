#!/usr/bin/env python3
import urllib.request
import db
import json
import time
import hashlib
import lib

# todo: move this key to some file
key="DF0GV3M5L6N2IE5"

def historical(stockList):
  for stock in stockList:
    url="https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol={}&apikey={}".format(stock, key)
    resraw  = cache_get(url)

    resjson = json.loads(resraw)
    if "Note" in resjson:
      resraw  = cache_get(url, True)
      resjson = json.loads(resraw)
      time.sleep(13)

    if 'Time Series (Daily)' not in resjson:
      print(resraw)
      return

    duration = 60 * 24
    for date,row in resjson['Time Series (Daily)'].items():
      db.insert('historical', {
        'ticker': stock,
        'open': row['1. open'],
        'high': row['2. high'],
        'low': row['3. low'],
        'close': row['4. close'],
        'begin': date,
        'duration': duration
      })
