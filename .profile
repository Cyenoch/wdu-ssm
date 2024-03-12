export PATH=${PWD}/bin/:$PATH
export PATH=${PWD}/scripts/:$PATH

export FABRIC_CFG_PATH=${PWD}/

source set_bureau.sh

export ORDERER_0=${PWD}/orderer/edu.cn/orderers/orderer0.edu.cn
export ORDERER_CAFILE=${ORDERER_0}/tls/tlscacerts/tls-localhost-7044-ca-orderer.pem
export EDU1_CAFILE=${PWD}/peer/school1.edu.cn/peers/peer0.school1.edu.cn/tls/ca.crt
export EDU2_CAFILE=${PWD}/peer/school2.edu.cn/peers/peer0.school2.edu.cn/tls/ca.crt
export BUREAU_CAFILE=${PWD}/peer/bureau.edu.cn/peers/peer0.bureau.edu.cn/tls/ca.crt
