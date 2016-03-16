#!/bin/bash

sudo rm -rf /Users/njy/Documents/publish/fe/5star_customer/**
sudo fis3 release prod -d /Users/njy/Documents/publish/fe/5star_customer

# cd /Users/njy/Documents/publish/fe/5star_customer

scp -r /Users/njy/Documents/publish/fe/5star_customer  search@43.241.208.207:/data/search/
# scp -r /Users/njy/Documents/publish/fe/5star_customer  search@43.241.208.209:/data/search/


