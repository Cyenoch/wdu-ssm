echo "Enrolling the CA admin"

docker-compose -f ./docker-compose.yaml up ca.bureau.edu.cn ca.school1.edu.cn ca.school2.edu.cn -d

function enrollCA() {
  
  export ORG_HOME=${PWD}/peer/bureau.edu.cn
  export ORG_CA_HOME=${PWD}/ca/bureau
  export FABRIC_CA_CLIENT_HOME=${ORG_HOME}

  mkdir -p $ORG_HOME

  fabric-ca-client enroll \
    -u https://admin:adminpw@localhost:7054 \
    --caname ca-bureau \
    --tls.certfiles "${ORG_CA_HOME}/ca-cert.pem"

  echo 'NodeOUs:
    Enable: true
    ClientOUIdentifier:
      Certificate: cacerts/localhost-7054-ca-org1.pem
      OrganizationalUnitIdentifier: client
    PeerOUIdentifier:
      Certificate: cacerts/localhost-7054-ca-org1.pem
      OrganizationalUnitIdentifier: peer
    AdminOUIdentifier:
      Certificate: cacerts/localhost-7054-ca-org1.pem
      OrganizationalUnitIdentifier: admin
    OrdererOUIdentifier:
      Certificate: cacerts/localhost-7054-ca-org1.pem
      OrganizationalUnitIdentifier: orderer' > "${PORG_HOME}/msp/config.yaml"

}
