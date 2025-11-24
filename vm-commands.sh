#!/bin/bash
# Quick deployment commands for VM (192.168.68.63)

cd ~/work-signal
git pull
docker compose down
docker compose up -d --build
docker compose exec backend python manage.py migrate
