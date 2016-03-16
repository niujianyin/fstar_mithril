#!/bin/bash

sudo rm -rf /Users/njy/Documents/publish/fe/5star_customer/**
sudo fis3 release -d /Users/njy/Documents/publish/fe/5star_customer

cd /Users/njy/Documents/publish/fe/5star_customer

scp -r css  root@43.241.208.237:/root/fivestar_fte_src
scp -r images  root@43.241.208.237:/root/fivestar_fte_src
scp -r scripts  root@43.241.208.237:/root/fivestar_fte_src
scp -r *.html  root@43.241.208.237:/root/fivestar_fte_src
scp -r map.jsp  root@43.241.208.237:/root/fivestar_fte_src