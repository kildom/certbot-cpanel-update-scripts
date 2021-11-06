#!/bin/bash

mkdir -p conf
mkdir -p work
mkdir -p logs

certbot certonly --manual --config-dir conf --work-dir work --logs-dir logs


