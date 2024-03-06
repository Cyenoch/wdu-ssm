export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="EducationBureauMSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/crypto-config/peerOrganizations/bureau.edu.cn/peers/peer0.bureau.edu.cn/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/crypto-config/peerOrganizations/bureau.edu.cn/users/Admin@bureau.edu.cn/msp
export CORE_PEER_ADDRESS=peer0.bureau.edu.cn:7051
