#!/usr/bin/python3

from flask import Flask, request, Response, jsonify
from flask_cors import CORS
import json
import logging
import lib
import robin

app = Flask(__name__)
CORS(app)

def res(what):
  return jsonify(what)

def success(what):
  return res({ 'res': True, 'data': what })

def failure(what):
  return res({ 'res': False, 'data': what })

@app.route('/dates')
def dates():
  return success(robin.get_dates('ticker, open, close'))

@app.route('/names', methods=['POST'])
def names():
  ticker_list = request.get_json()
  print(request.get_json())
  return json.dumps(robin.get_names(ticker_list)), 200

if __name__ == '__main__':
  app.run(port=4001)
