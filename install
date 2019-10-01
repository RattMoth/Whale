#!/bin/bash

sudo apt install redis-server sqlite3
[[ -e trades.db ]] || gunzip -c trades.db.gz 
cd api
pip3 install -r requirements.txt

