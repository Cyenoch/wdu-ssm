运行 startup.sh


要设置的:
```bash
cd network

# 设置PATH
export PATH=${PWD}/bin/:$PATH
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
source set_bureau.sh

# orderer节点目录
export ORDERER_0=${PWD}/crypto-config/ordererOrganizations/edu.cn/orderers/orderer0.edu.cn

# 配置hosts文件
echo -e "127.0.0.1  peer0.school1.edu.cn \n\
127.0.0.1  peer0.school2.edu.cn \n\
127.0.0.1  orderer0.edu.cn \n\
127.0.0.1  peer0.bureau.edu.cn" | sudo tee -a /etc/hosts;

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
osnadmin channel list -o orderer0.edu.cn:7053 --ca-file "${ORDERER_0}/msp/tlscacerts/tlsca.edu.cn-cert.pem" --client-cert "${ORDERER_0}/tls/server.crt" --client-key "${ORDERER_0}/tls/server.key"
```

orderer节点加入channel
```bash
# 默认加入了system-channel 所以不需要这个操作
osnadmin channel join --channelID system-channel --config-block ./system-genesis-block/genesis.block -o orderer0.bureau.edu.cn:7053 --ca-file "${ORDERER_0}/msp/tlscacerts/tlsca.bureau.edu.cn-cert.pem" --client-cert "${ORDERER_0}/tls/server.crt" --client-key "${ORDERER_0}/tls/server.key"
```
