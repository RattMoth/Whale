#!/bin/bash

sudo apt install redis-server sqlite3
[[ -e trades.db ]] || gunzip trades.db.gz 
cd api
pip3 install -r requirements.txt

