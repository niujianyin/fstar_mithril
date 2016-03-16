#!/bin/bash

sudo rm -rf /Users/njy/Documents/publish/fe/5star_customer/**
sudo fis3 release -d /Users/njy/Documents/publish/fe/5star_customer

cd /Users/njy/Documents/publish/fe/5star_customer

sudo scp -i ../../cn-dev.pem -r css  ec2-user@dev0.xiayizhan.mobi:/home/ec2-user/fivestar_fte_src
sudo scp -i ../../cn-dev.pem -r images  ec2-user@dev0.xiayizhan.mobi:/home/ec2-user/fivestar_fte_src
sudo scp -i ../../cn-dev.pem -r scripts  ec2-user@dev0.xiayizhan.mobi:/home/ec2-user/fivestar_fte_src
sudo scp -i ../../cn-dev.pem -r *.html  ec2-user@dev0.xiayizhan.mobi:/home/ec2-user/fivestar_fte_src
sudo scp -i ../../cn-dev.pem -r map.jsp  ec2-user@dev0.xiayizhan.mobi:/home/ec2-user/fivestar_fte_src


