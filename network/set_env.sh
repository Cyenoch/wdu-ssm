#!/bin/bash

__foo() {
  DOMAIN=${x:-"edb"}
  CFG_PATH=$(realpath ./)
  export FABRIC_CFG_PATH=$CFG_PATH
  export CORE_PEER_ADDRESS=peer0.$DOMAIN.ssm.yeyu.tech:7051
  export CORE_PEER_TLS_ENABLED=true
  export CORE_PEER_TLS_CERT_FILE=crypto-config/peerOrganizations/$DOMAIN.ssm.yeyu.tech/peers/peer0.$DOMAIN.ssm.yeyu.tech/tls/server.crt
  export CORE_PEER_TLS_KEY_FILE=crypto-config/peerOrganizations/$DOMAIN.ssm.yeyu.tech/peers/peer0.$DOMAIN.ssm.yeyu.tech/tls/server.key
  export CORE_PEER_TLS_ROOTCERT_FILE=crypto-config/peerOrganizations/$DOMAIN.ssm.yeyu.tech/peers/peer0.$DOMAIN.ssm.yeyu.tech/tls/ca.crt
  export CORE_PEER_LOCALMSPID="EducationBureauMSP"
  export CORE_PEER_MSPCONFIGPATH=crypto-config/peerOrganizations/$DOMAIN.ssm.yeyu.tech/peers/peer0.$DOMAIN.ssm.yeyu.tech/msp
}

__foo
# export CORE_PEER_TLS_ENABLED=true
# export CORE_PEER_MSPCONFIGPATH=crypto-config/peerOrganizations/edb.ssm.yeyu.tech/peers/peer0.edb.ssm.yeyu.tech/msp
# export FABRIC_CFG_PATH=$(realpath ./)
# export CORE_PEER_LOCALMSPID=EducationBureauMSP
# peer lifecycle chaincode install ../chaincode/student/students.tar.gz --peerAddresses peer0.edb.ssm.yeyu.tech:7051 --tlsRootCertFiles crypto-config/peerOrganizations/edb.ssm.yeyu.tech/peers/peer0.edb.ssm.yeyu.tech/tls/ca.crt
