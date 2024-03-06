export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="EduOrdererMSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/crypto-config/ordererOrganizations/edu.cn/orderers/orderer0.edu.cn/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/crypto-config/ordererOrganizations/edu.cn/users/Admin@edu.cn/msp
export CORE_PEER_ADDRESS=orderer0.edu.cn:7050
