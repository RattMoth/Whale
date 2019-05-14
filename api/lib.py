#!/usr/bin/env python3
import redis
import urllib.request
import db
import json
import hashlib
import robin
import time

r = redis.Redis(host='localhost', port=6379, db=0,charset="utf-8", decode_responses=True)

def showError(what):
  print("Error: {}".format(what))

def upgrade():
  db.upgrade()

def cache_get(url, force = False, wait_until = False):
  key = "c:{}".format(hashlib.md5(url.encode('utf-8')).hexdigest())
  if not r.exists(key) or force:
    if wait_until:
      time.sleep(wait_until - time.time())

    req  = urllib.request.Request(url)

    with urllib.request.urlopen(req) as response:
      r.set(key, response.read(), 60 * 60 * 12)

  return r.get(key)
  

