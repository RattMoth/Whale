#!/usr/bin/env python3
import redis
import db

r = redis.Redis(host='localhost', port=6379, db=0,charset="utf-8", decode_responses=True)

def showError(what):
  print("Error: {}".format(what))

def upgrade():
  db.upgrade()


