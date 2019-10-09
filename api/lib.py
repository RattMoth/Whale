#!/usr/bin/env python3
import redis
import requests
import urllib.request
import db
import json
import hashlib
import robin
import time

r = redis.Redis(host='localhost', port=6379, db=0,charset="utf-8", decode_responses=True)

_key = 'Fp4w7nMCMEzV5LyvqWFIH9CJxgPsO60lw6tOgvITVK9EJYz46y3rd1sgbJiA'
def showError(what):
  print("Error: {}".format(what))

def upgrade():
  db.upgrade()

def get_name(tickerlist):
  r = requests.get('https://api.worldtradingdata.com/api/v1/stock?symbol={}&api_token={}'.format(tickerlist,_key))
  json = r.json()
  try:
    return json['data'][0]['name']
  except:
    print(tickerlist,json)

def ticker2name(ticker):
  name = r.hget('name', ticker)
  if not name:
    fullname = get_name(ticker) 
    r.hset('name', ticker, fullname)
    return fullname

  return name

def cache_get(url, force = False, wait_until = False):
  key = "c:{}".format(hashlib.md5(url.encode('utf-8')).hexdigest())
  if not r.exists(key) or force:
    if wait_until:
      time.sleep(wait_until - time.time())

    req  = urllib.request.Request(url)

    with urllib.request.urlopen(req) as response:
      r.set(key, response.read(), 60 * 60 * 24 * 30)

  return r.get(key)
  
