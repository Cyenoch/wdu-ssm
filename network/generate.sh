#!/bin/bash

cryptogen generate --config=./crypto-config.yaml
configtxgen -outputBlock system_genesis_block/genesis_block.pb -profile ChannelUsingRaft --channelID application-channel-1 -configPath ./
