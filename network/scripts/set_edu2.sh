export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="School2MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/crypto-config/peerOrganizations/school2.edu.cn/peers/peer0.school2.edu.cn/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/crypto-config/peerOrganizations/school2.edu.cn/users/Admin@school2.edu.cn/msp
export CORE_PEER_ADDRESS=peer0.school2.edu.cn:7061
