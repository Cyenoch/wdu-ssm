#!/bin/bash

cd ..
export PATH=${PWD}/../bin/:$PATH
export PATH=${PWD}/scripts/:$PATH
export FABRIC_CFG_PATH=${PWD}/

source set_edu1.sh

echo "127.0.0.1  peer0.school1.edu.cn \
127.0.0.1  peer0.school2.edu.cn \
127.0.0.1  orderer0.board.edu.cn" | sudo tee -a /etc/hosts

docker-compose up -d

osnadmin channel list -o orderer0.board.edu.cn:7053 --ca-file "${ORDERER_0}/msp/tlscacerts/tlsca.board.edu.cn-cert.pem" --client-cert "${ORDERER_0}/tls/server.crt" --client-key "${ORDERER_0}/tls/server.key"

#----------------------------------------------------#
echo "create channel"

source set_edu1.sh
peer channel create -o localhost:7050 --ordererTLSHostnameOverride orderer0.board.edu.cn -c two-edu-channel -f ./channel-artifacts/two-edu-channel.tx --outputBlock ./channel-artifacts/two-edu-channel.block --tls --cafile "${ORDERER_0}/msp/tlscacerts/tlsca.board.edu.cn-cert.pem"

#----------------------------------------------------#
echo "join channels"

source set_edu1.sh
peer channel join -b ./channel-artifacts/two-edu-channel.block
source set_edu2.sh
peer channel join -b ./channel-artifacts/two-edu-channel.block

#----------------------------------------------------#
echo "set edu1 anchor peer"

source set_edu1.sh
peer channel fetch config channel-artifacts/config_block.pb -o localhost:7050 --ordererTLSHostnameOverride orderer0.board.edu.cn -c two-edu-channel --tls --cafile "${ORDERER_0}/msp/tlscacerts/tlsca.board.edu.cn-cert.pem"
cd channel-artifacts
configtxlator proto_decode --input config_block.pb --type common.Block --output config_block.json
jq '.data.data[0].payload.data.config' config_block.json > config.json
jq '.channel_group.groups.Application.groups.School1MSP.values += {"AnchorPeers":{"mod_policy": "Admins","value":{"anchor_peers": [{"host": "peer0.school1.edu.cn","port": 7051}]},"version": "0"}}' config.json > config_modified.json
configtxlator proto_encode --input config.json --type common.Config --output config.pb
configtxlator proto_encode --input config_modified.json --type common.Config --output config_modified.pb
configtxlator compute_update --channel_id two-edu-channel --original config.pb --updated config_modified.pb --output config_update.pb
configtxlator proto_decode --input config_update.pb --type common.ConfigUpdate --output config_update.json
echo '{"payload":{"header":{"channel_header":{"channel_id":"two-edu-channel", "type":2}},"data":{"config_update":'$(cat config_update.json)'}}}' | jq . > config_update_in_envelope.json
configtxlator proto_encode --input config_update_in_envelope.json --type common.Envelope --output config_update_in_envelope.pb
peer channel update -f config_update_in_envelope.pb -c two-edu-channel -o localhost:7050 --ordererTLSHostnameOverride orderer0.board.edu.cn -c two-edu-channel --tls --cafile "${ORDERER_0}/msp/tlscacerts/tlsca.board.edu.cn-cert.pem"
cd ..

#----------------------------------------------------#
echo "set edu2 anchor peer"

source set_edu2.sh
peer channel fetch config channel-artifacts/config_block.pb -o localhost:7050 --ordererTLSHostnameOverride orderer0.board.edu.cn -c two-edu-channel --tls --cafile "${ORDERER_0}/msp/tlscacerts/tlsca.board.edu.cn-cert.pem"
cd channel-artifacts
configtxlator proto_decode --input config_block.pb --type common.Block --output config_block.json
jq '.data.data[0].payload.data.config' config_block.json > config.json
jq '.channel_group.groups.Application.groups.School2MSP.values += {"AnchorPeers":{"mod_policy": "Admins","value":{"anchor_peers": [{"host": "peer0.school2.edu.cn","port": 7061}]},"version": "0"}}' config.json > config_modified.json
configtxlator proto_encode --input config.json --type common.Config --output config.pb
configtxlator proto_encode --input config_modified.json --type common.Config --output config_modified.pb
configtxlator compute_update --channel_id two-edu-channel --original config.pb --updated config_modified.pb --output config_update.pb
configtxlator proto_decode --input config_update.pb --type common.ConfigUpdate --output config_update.json
echo '{"payload":{"header":{"channel_header":{"channel_id":"two-edu-channel", "type":2}},"data":{"config_update":'$(cat config_update.json)'}}}' | jq . > config_update_in_envelope.json
configtxlator proto_encode --input config_update_in_envelope.json --type common.Envelope --output config_update_in_envelope.pb
peer channel update -f config_update_in_envelope.pb -c two-edu-channel -o localhost:7050 --ordererTLSHostnameOverride orderer0.board.edu.cn -c two-edu-channel --tls --cafile "${ORDERER_0}/msp/tlscacerts/tlsca.board.edu.cn-cert.pem"
cd ..
