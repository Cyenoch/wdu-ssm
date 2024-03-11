#!/bin/bash

export PATH=${PWD}/bin/:$PATH
export PATH=${PWD}/scripts/:$PATH

export FABRIC_CFG_PATH=${PWD}/

source set_bureau.sh

export ORDERER_0=${PWD}/orderer/edu.cn/orderers/orderer0.edu.cn
export ORDERER_CAFILE=${ORDERER_0}/msp/tlscacerts/tlsca.edu.cn-cert.pem
export EDU1_CAFILE=${PWD}/peer/school1.edu.cn/peers/peer0.school1.edu.cn/tls/ca.crt
export EDU2_CAFILE=${PWD}/peer/school2.edu.cn/peers/peer0.school2.edu.cn/tls/ca.crt
export BUREAU_CAFILE=${PWD}/peer/bureau.edu.cn/peers/peer0.bureau.edu.cn/tls/ca.crt


while getopts "deih" opt; do
  case $opt in
    i)
      echo "-i initial config and block";
      cryptogen generate --config ./crypto-config.yaml --output=./crypto-config;
      configtxgen -profile EducationNetwork -outputBlock ./system-genesis-block/genesis.block -channelID system-channel;
      configtxgen -profile TwoEducationChannel -outputCreateChannelTx ./channel-artifacts/two-edu-channel.tx -channelID two-edu-channel;
      exit;
      ;;
    d)
      echo "-d will remove docker-compose down -v and reset ca";
      docker-compose down -v;
      sudo rm -rf peer/bureau.edu.cn/ca
      sudo rm -rf peer/school1.edu.cn/ca
      sudo rm -rf peer/school2.edu.cn/ca
      # rm -f peer/bureau.edu.cn/ca/ca-cert.pem
      # rm -f peer/bureau.edu.cn/ca/fabric-ca-server.db
      # rm -f peer/bureau.edu.cn/ca/IssuerPublicKey
      # rm -f peer/bureau.edu.cn/ca/IssuerRevocationPublicKey
      # rm -f peer/bureau.edu.cn/ca/tls-cert.pem
      # rm -f peer/school1.edu.cn/ca/ca-cert.pem
      # rm -f peer/school1.edu.cn/ca/fabric-ca-server.db
      # rm -f peer/school1.edu.cn/ca/IssuerPublicKey
      # rm -f peer/school1.edu.cn/ca/IssuerRevocationPublicKey
      # rm -f peer/school1.edu.cn/ca/tls-cert.pem
      # rm -f peer/school2.edu.cn/ca/ca-cert.pem
      # rm -f peer/school2.edu.cn/ca/fabric-ca-server.db
      # rm -f peer/school2.edu.cn/ca/IssuerPublicKey
      # rm -f peer/school2.edu.cn/ca/IssuerRevocationPublicKey
      # rm -f peer/school2.edu.cn/ca/tls-cert.pem
      exit;
      ;;
    e)
      echo "-e echo something"
      exit;
      ;;
    h)
      echo "-h set hosts";
      echo -e "127.0.0.1  peer0.school1.edu.cn \n\
127.0.0.1  peer0.school2.edu.cn \n\
127.0.0.1  orderer0.edu.cn \n\
127.0.0.1  peer0.bureau.edu.cn \n\
127.0.0.1  ca.bureau.edu.cn \n\
127.0.0.1  ca.school1.edu.cn \n\
127.0.0.1  ca.school2.edu.cn" | sudo tee -a /etc/hosts;
      exit;
      ;;
    \?)
      ;;
  esac
done

docker-compose up -d

echo "waiting docker container up..."

sleep 2

source set_bureau.sh
peer channel create -o localhost:7050 --ordererTLSHostnameOverride orderer0.edu.cn -c two-edu-channel -f ./channel-artifacts/two-edu-channel.tx --outputBlock ./channel-artifacts/two-edu-channel.block --tls --cafile ${ORDERER_CAFILE}

source set_bureau.sh
peer channel join -b ./channel-artifacts/two-edu-channel.block

source set_edu1.sh
peer channel join -b ./channel-artifacts/two-edu-channel.block

source set_edu2.sh
peer channel join -b ./channel-artifacts/two-edu-channel.block

source set_bureau.sh
peer channel fetch config channel-artifacts/config_block.pb -o localhost:7050 --ordererTLSHostnameOverride orderer0.edu.cn -c two-edu-channel --tls --cafile ${ORDERER_CAFILE}
cd channel-artifacts
configtxlator proto_decode --input config_block.pb --type common.Block --output config_block.json
jq '.data.data[0].payload.data.config' config_block.json > config.json
jq '.channel_group.groups.Application.groups.EducationBureauMSP.values += {"AnchorPeers":{"mod_policy": "Admins","value":{"anchor_peers": [{"host": "peer0.bureau.edu.cn","port": 7051}]},"version": "0"}}' config.json > config_modified.json
configtxlator proto_encode --input config.json --type common.Config --output config.pb
configtxlator proto_encode --input config_modified.json --type common.Config --output config_modified.pb
configtxlator compute_update --channel_id two-edu-channel --original config.pb --updated config_modified.pb --output config_update.pb
configtxlator proto_decode --input config_update.pb --type common.ConfigUpdate --output config_update.json
echo '{"payload":{"header":{"channel_header":{"channel_id":"two-edu-channel", "type":2}},"data":{"config_update":'$(cat config_update.json)'}}}' | jq . > config_update_in_envelope.json
configtxlator proto_encode --input config_update_in_envelope.json --type common.Envelope --output config_update_in_envelope.pb
peer channel update -f config_update_in_envelope.pb -c two-edu-channel -o localhost:7050 --ordererTLSHostnameOverride orderer0.edu.cn -c two-edu-channel --tls --cafile ${ORDERER_CAFILE}
cd -

source set_edu1.sh
peer channel fetch config channel-artifacts/config_block.pb -o localhost:7050 --ordererTLSHostnameOverride orderer0.edu.cn -c two-edu-channel --tls --cafile ${ORDERER_CAFILE}
cd channel-artifacts
configtxlator proto_decode --input config_block.pb --type common.Block --output config_block.json
jq '.data.data[0].payload.data.config' config_block.json > config.json
jq '.channel_group.groups.Application.groups.School1MSP.values += {"AnchorPeers":{"mod_policy": "Admins","value":{"anchor_peers": [{"host": "peer0.school1.edu.cn","port": 7061}]},"version": "0"}}' config.json > config_modified.json
configtxlator proto_encode --input config.json --type common.Config --output config.pb
configtxlator proto_encode --input config_modified.json --type common.Config --output config_modified.pb
configtxlator compute_update --channel_id two-edu-channel --original config.pb --updated config_modified.pb --output config_update.pb
configtxlator proto_decode --input config_update.pb --type common.ConfigUpdate --output config_update.json
echo '{"payload":{"header":{"channel_header":{"channel_id":"two-edu-channel", "type":2}},"data":{"config_update":'$(cat config_update.json)'}}}' | jq . > config_update_in_envelope.json
configtxlator proto_encode --input config_update_in_envelope.json --type common.Envelope --output config_update_in_envelope.pb
peer channel update -f config_update_in_envelope.pb -c two-edu-channel -o localhost:7050 --ordererTLSHostnameOverride orderer0.edu.cn -c two-edu-channel --tls --cafile ${ORDERER_CAFILE}
cd -

source set_edu2.sh
peer channel fetch config channel-artifacts/config_block.pb -o localhost:7050 --ordererTLSHostnameOverride orderer0.edu.cn -c two-edu-channel --tls --cafile ${ORDERER_CAFILE}
cd channel-artifacts
configtxlator proto_decode --input config_block.pb --type common.Block --output config_block.json
jq '.data.data[0].payload.data.config' config_block.json > config.json
jq '.channel_group.groups.Application.groups.School2MSP.values += {"AnchorPeers":{"mod_policy": "Admins","value":{"anchor_peers": [{"host": "peer0.school2.edu.cn","port": 7071}]},"version": "0"}}' config.json > config_modified.json
configtxlator proto_encode --input config.json --type common.Config --output config.pb
configtxlator proto_encode --input config_modified.json --type common.Config --output config_modified.pb
configtxlator compute_update --channel_id two-edu-channel --original config.pb --updated config_modified.pb --output config_update.pb
configtxlator proto_decode --input config_update.pb --type common.ConfigUpdate --output config_update.json
echo '{"payload":{"header":{"channel_header":{"channel_id":"two-edu-channel", "type":2}},"data":{"config_update":'$(cat config_update.json)'}}}' | jq . > config_update_in_envelope.json
configtxlator proto_encode --input config_update_in_envelope.json --type common.Envelope --output config_update_in_envelope.pb
peer channel update -f config_update_in_envelope.pb -c two-edu-channel -o localhost:7050 --ordererTLSHostnameOverride orderer0.edu.cn -c two-edu-channel --tls --cafile ${ORDERER_CAFILE}
cd -

echo "installing chaincode..."

source set_bureau.sh
(cd chaincode/sm; GO111MODULE=on go mod vendor)
peer lifecycle chaincode package ./sm.tar.gz --path ./chaincode/sm --label sm_1.0

source set_bureau.sh
peer lifecycle chaincode install ./sm.tar.gz
source set_edu1.sh
peer lifecycle chaincode install ./sm.tar.gz
source set_edu2.sh
peer lifecycle chaincode install ./sm.tar.gz

source set_bureau.sh
peer lifecycle chaincode queryinstalled
# Change to actual value
export CC_ID=$(peer lifecycle chaincode queryinstalled | awk -F'Package ID:' '{print $2}' | awk -F',' '{gsub(/^ *| *$/,""); print $1}' | grep ':')
echo "CC_ID = $CC_ID"

source set_bureau.sh
peer lifecycle chaincode approveformyorg --channelID two-edu-channel --name sm --version 1.1 --package-id ${CC_ID} --sequence 1 --tls --cafile ${ORDERER_CAFILE} --orderer localhost:7050 --ordererTLSHostnameOverride orderer0.edu.cn
source set_edu1.sh
peer lifecycle chaincode approveformyorg --channelID two-edu-channel --name sm --version 1.1 --package-id ${CC_ID} --sequence 1 --tls --cafile ${ORDERER_CAFILE} --orderer localhost:7050 --ordererTLSHostnameOverride orderer0.edu.cn
source set_edu2.sh
peer lifecycle chaincode approveformyorg --channelID two-edu-channel --name sm --version 1.1 --package-id ${CC_ID} --sequence 1 --tls --cafile ${ORDERER_CAFILE} --orderer localhost:7050 --ordererTLSHostnameOverride orderer0.edu.cn

source set_bureau.sh
peer lifecycle chaincode checkcommitreadiness --channelID two-edu-channel --name sm --version 1.1 --sequence 1 --tls --cafile ${ORDERER_CAFILE} --output json
peer lifecycle chaincode commit --channelID two-edu-channel --name sm --version 1.1 --sequence 1 --tls --cafile ${ORDERER_CAFILE} --orderer localhost:7050 --ordererTLSHostnameOverride orderer0.edu.cn --peerAddresses peer0.bureau.edu.cn:7051 --tlsRootCertFiles ${BUREAU_CAFILE} --peerAddresses peer0.school1.edu.cn:7061 --tlsRootCertFiles ${EDU1_CAFILE} --peerAddresses peer0.school2.edu.cn:7071 --tlsRootCertFiles ${EDU2_CAFILE} 
peer lifecycle chaincode querycommitted --channelID two-edu-channel --name sm --cafile ${ORDERER_CAFILE}

echo "calling init ledger..."
peer chaincode invoke -C two-edu-channel -n sm -c '{"function":"InitLedger","Args":[]}' --peerAddresses peer0.bureau.edu.cn:7051 --tlsRootCertFiles ${BUREAU_CAFILE} --peerAddresses peer0.school1.edu.cn:7061 --tlsRootCertFiles ${EDU1_CAFILE} --peerAddresses peer0.school2.edu.cn:7071 --tlsRootCertFiles ${EDU2_CAFILE} --tls --cafile ${ORDERER_CAFILE} --orderer localhost:7050 --ordererTLSHostnameOverride orderer0.edu.cn

sleep 2

echo "querying students..."
peer chaincode query -C two-edu-channel -n sm -c '{"Args":["GetStudents"]}'

echo "done."
