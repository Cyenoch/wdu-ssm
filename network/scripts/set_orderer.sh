export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="EducationBoardOrdererMSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/crypto-config/ordererOrganizations/board.edu.cn/orderers/orderer0.board.edu.cn/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/crypto-config/ordererOrganizations/board.edu.cn/users/Admin@board.edu.cn/msp
export CORE_PEER_ADDRESS=orderer0.board.edu.cn:7050
