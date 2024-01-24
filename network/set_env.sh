#!/bin/bash

__foo() {
  DOMAIN=${x:-"edb"}
  CFG_PATH=$(realpath ./)
  export FABRIC_CFG_PATH=$CFG_PATH
  export CORE_PEER_ADDRESS=$DOMAIN:7051
  export CORE_PEER_TLS_ENABLED=true
  export CORE_PEER_TLS_ROOTCERT_FILE=crypto-config/peerOrganizations/$DOMAIN.ssm.yeyu.tech/peers/peer0.$DOMAIN.ssm.yeyu.tech/tls/ca.crt
  export CORE_PEER_LOCALMSPID="EducationBureauMSP"
  export CORE_PEER_MSPCONFIGPATH=crypto-config/peerOrganizations/$DOMAIN.ssm.yeyu.tech/peers/peer0.$DOMAIN.ssm.yeyu.tech/msp
}

__foo
