运行 startup.sh


要设置的:
```bash
cd network

# 设置PATH
export PATH=${PWD}/../bin/:$PATH
export PATH=${PWD}/scripts/:$PATH

# 固定需要设置
export FABRIC_CFG_PATH=${PWD}/

# 实例 设置当前使用的配置 
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="School1MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/crypto-config/peerOrganizations/school1.edu.cn/peers/peer0.school1.edu.cn/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/crypto-config/peerOrganizations/school1.edu.cn/users/Admin@school1.edu.cn/msp
export CORE_PEER_ADDRESS=peer0.school1.edu.cn:7051

# 切换配置文件
source set_edu1.sh

# orderer节点目录
export ORDERER_0=${PWD}/crypto-config/ordererOrganizations/board.edu.cn/orderers/orderer0.board.edu.cn

# 配置hosts文件
echo "127.0.0.1  peer0.school1.edu.cn \
127.0.0.1  peer0.school2.edu.cn \
127.0.0.1  orderer0.board.edu.cn" | sudo tee -a /etc/hosts

```

创建密钥文件
```bash
cryptogen generate --config ./crypto-config.yaml --output=./organizations
```

创建上帝区块
```bash
configtxgen -profile EducationNetwork -outputBlock ./system-genesis-block/genesis.block -channelID system-channel
```

创建two-edu-channel
```bash
configtxgen -profile TwoEducationChannel -outputCreateChannelTx ./channel-artifacts/two-edu-channel.tx -channelID two-edu-channel
```

启动
```bash
docker-compose up -d
```

查看orderer节点加入的通道
```bash
osnadmin channel list -o orderer0.board.edu.cn:7053 --ca-file "${ORDERER_0}/msp/tlscacerts/tlsca.board.edu.cn-cert.pem" --client-cert "${ORDERER_0}/tls/server.crt" --client-key "${ORDERER_0}/tls/server.key"
```

orderer节点加入channel
```bash
# 默认加入了system-channel 所以不需要这个操作
osnadmin channel join --channelID system-channel --config-block ./system-genesis-block/genesis.block -o orderer0.board.edu.cn:7053 --ca-file "${ORDERER_0}/msp/tlscacerts/tlsca.board.edu.cn-cert.pem" --client-cert "${ORDERER_0}/tls/server.crt" --client-key "${ORDERER_0}/tls/server.key"
```

创建channel 学校与学校间可以通信
```bash
source set_edu1.sh
peer channel create -o localhost:7050 --ordererTLSHostnameOverride orderer0.board.edu.cn -c two-edu-channel -f ./channel-artifacts/two-edu-channel.tx --outputBlock ./channel-artifacts/two-edu-channel.block --tls --cafile "${ORDERER_0}/msp/tlscacerts/tlsca.board.edu.cn-cert.pem"
```

俩学校节点加入channel
```bash
source set_edu1.sh
peer channel join -b ./channel-artifacts/two-edu-channel.block

source set_edu2.sh
peer channel join -b ./channel-artifacts/two-edu-channel.block
```

导出edu1通道配置
```bash
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
```

配置edu2通道
```bash
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
```

部署链码
```bash
echo "installing chaincode..."

source set_edu1.sh

peer lifecycle chaincode package ./sm.tar.gz --path ./chaincode/sm --label sm_1.0

peer lifecycle chaincode install ./sm.tar.gz
source set_edu2.sh
peer lifecycle chaincode install ./sm.tar.gz
source set_edu1.sh

peer lifecycle chaincode queryinstalled

export CC_ID="sm_1.0:07f8cc90f1717185f7bd54c027ededa10f3bcf66a6def65ac0f25c11d15c9abc"

peer lifecycle chaincode approveformyorg --channelID two-edu-channel --name sm --version 1.1 --package-id ${CC_ID} --sequence 1 --tls --cafile ${ORDERER_CAFILE} --orderer localhost:7050 --ordererTLSHostnameOverride orderer0.board.edu.cn
source set_edu2.sh
peer lifecycle chaincode approveformyorg --channelID two-edu-channel --name sm --version 1.1 --package-id ${CC_ID} --sequence 1 --tls --cafile ${ORDERER_CAFILE} --orderer localhost:7050 --ordererTLSHostnameOverride orderer0.board.edu.cn
source set_edu1.sh

peer lifecycle chaincode checkcommitreadiness --channelID two-edu-channel --name sm --version 1.1 --sequence 1 --tls --cafile ${ORDERER_CAFILE} --output json

peer lifecycle chaincode commit --channelID two-edu-channel --name sm --version 1.1 --sequence 1 --tls --cafile ${ORDERER_CAFILE} --orderer localhost:7050 --ordererTLSHostnameOverride orderer0.board.edu.cn --peerAddresses peer0.school1.edu.cn:7051 --tlsRootCertFiles ${EDU1_CAFILE} --peerAddresses peer0.school2.edu.cn:7061 --tlsRootCertFiles ${EDU2_CAFILE} 

peer lifecycle chaincode querycommitted --channelID two-edu-channel --name sm --cafile ${ORDERER_CAFILE}

echo "calling init ledger..."

peer chaincode invoke -C two-edu-channel -n sm --peerAddresses peer0.school1.edu.cn:7051 --tlsRootCertFiles "${EDU1_CAFILE}" -c '{"function":"InitLedger","Args":[]}' --tls --cafile ${ORDERER_CAFILE} --orderer localhost:7050 --ordererTLSHostnameOverride orderer0.board.edu.cn

echo "done."
```
