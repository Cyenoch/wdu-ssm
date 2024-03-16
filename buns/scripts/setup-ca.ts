import { $, sleep } from "bun"
import assert from 'node:assert/strict'
import path from 'node:path'
import { readdir } from 'node:fs/promises'

// 用于初始化CA证书、Peer MSP、User MSP的脚本

await $`docker-compose -f ../docker-compose.yaml up ca.bureau.edu.cn ca.school1.edu.cn ca.school2.edu.cn ca.orderer.edu.cn -d`

await sleep(2000)

async function enrollOrgCA(
  {
    host,
    port,
    caName,
    caHost,
    caPort,
    kind,
    userAffiliation
  }: {
    host: string,
    port: number,
    caName: `ca-${string}`,
    caHost: string,
    caPort: number,
    userAffiliation: string,
    kind: 'peer' | 'orderer'
  }
) {
  // const host = 'bureau.edu.cn'
  // const port = 7051
  // const caName = 'ca-bureau'
  // const caHost = 'localhost'
  // const caPort = 7054

  const home = path.resolve(`../${kind}/${host}`)
  const caHome = path.resolve(`../ca/${caName.replace(/^ca-/, '')}`)

  console.info('ca home', caHome)

  const caCert = `${caHome}/ca-cert.pem`
  const peer0Home = `${home}/${kind}s/${kind}0.${host}`
  const user0Home = `${home}/users/User0@${host}`
  const admin0Home = `${home}/users/Admin0@${host}`

  Bun.env['FABRIC_CA_CLIENT_HOME'] = home

  await $`mkdir -p ${home}`

  console.info(`生成CA证书 ${host}`)
  await $`fabric-ca-client enroll -u https://admin:adminpw@${caHost}:${caPort} --caname ${caName} --tls.certfiles ${caCert}`

  await Bun.write(
    Bun.file(path.resolve(home, 'msp/config.yaml')),
    `NodeOUs:
  Enable: true
  ClientOUIdentifier:
    Certificate: cacerts/${caHost}-${caPort}-${caName}.pem
    OrganizationalUnitIdentifier: client
  PeerOUIdentifier:
    Certificate: cacerts/${caHost}-${caPort}-${caName}.pem
    OrganizationalUnitIdentifier: peer
  AdminOUIdentifier:
    Certificate: cacerts/${caHost}-${caPort}-${caName}.pem
    OrganizationalUnitIdentifier: admin
  OrdererOUIdentifier:
    Certificate: cacerts/${caHost}-${caPort}-${caName}.pem
    OrganizationalUnitIdentifier: orderer`,
  )

  await $`mkdir -p ${home}/msp/tlscacerts`
  await $`cp ${caCert} ${home}/msp/tlscacerts/ca.crt`

  await $`mkdir -p ${home}/tlsca`
  await $`cp ${caCert} ${home}/tlsca/tlsca.${host}-cert.pem`

  await $`mkdir -p ${home}/ca`
  await $`cp ${caCert} ${home}/ca/ca.${host}-cert.pem`

  console.info(`注册 users ${host}`)
  if (kind === 'peer') {
    await $`fabric-ca-client register --caname ${caName} --id.name peer0 --id.secret peer0pw --id.type peer --tls.certfiles ${caCert}`
    await $`fabric-ca-client register --caname ${caName} --id.name user0 --id.affiliation ${userAffiliation} --id.secret user0pw --id.type client --tls.certfiles ${caCert}`
  }
  else
    await $`fabric-ca-client register --caname ${caName} --id.name orderer0 --id.secret orderer0pw --id.type orderer --tls.certfiles ${caCert}`

  await $`fabric-ca-client register --caname ${caName} --id.name admin0 --id.secret admin0pw --id.type admin --tls.certfiles ${caCert}`

  if (kind === 'peer') {
    console.info(`生成 peer0 MSP ${host}`)
    await $`fabric-ca-client enroll -u https://peer0:peer0pw@${caHost}:${caPort} --caname ${caName} -M ${peer0Home}/msp --tls.certfiles ${caCert}`
    await $`cp ${home}/msp/config.yaml ${peer0Home}/msp/config.yaml`
    await $`fabric-ca-client enroll -u https://peer0:peer0pw@${caHost}:${caPort} --caname ${caName} -M ${peer0Home}/tls --enrollment.profile tls --csr.hosts peer0.${host} --csr.hosts ${caHost} --tls.certfiles ${caCert}`

    await $`cp ${peer0Home}/tls/tlscacerts/tls-${caHost}-${caPort}-${caName}.pem ${peer0Home}/tls/ca.crt`
    await $`cp ${peer0Home}/tls/signcerts/cert.pem ${peer0Home}/tls/server.crt`
    await $`cp ${await firstFile(`${peer0Home}/tls/keystore/`)} ${peer0Home}/tls/server.key`


    console.info(`生成 user0 MSP ${host}`)
    await $`fabric-ca-client enroll -u https://user0:user0pw@${caHost}:${caPort} --caname ${caName} -M ${user0Home}/msp --tls.certfiles ${caCert}`
    await $`cp ${home}/msp/config.yaml ${user0Home}/msp/config.yaml`
  } else {
    console.info(`生成 orderer0 MSP ${host}`)
    await $`fabric-ca-client enroll -u https://orderer0:orderer0pw@${caHost}:${caPort} --caname ${caName} -M ${peer0Home}/msp --tls.certfiles ${caCert}`
    await $`cp ${home}/msp/config.yaml ${peer0Home}/msp/config.yaml`
    await $`fabric-ca-client enroll -u https://orderer0:orderer0pw@${caHost}:${caPort} --caname ${caName} -M ${peer0Home}/tls --enrollment.profile tls --csr.hosts orderer0.${host} --csr.hosts ${caHost} --tls.certfiles ${caCert}`

    await $`cp ${peer0Home}/tls/tlscacerts/tls-${caHost}-${caPort}-${caName}.pem ${peer0Home}/tls/ca.crt`
    await $`cp ${peer0Home}/tls/signcerts/cert.pem ${peer0Home}/tls/server.crt`
    await $`cp ${await firstFile(`${peer0Home}/tls/keystore/`)} ${peer0Home}/tls/server.key`
  }

  console.info(`生成 admin0 MSP ${host}`)
  await $`fabric-ca-client enroll -u https://admin0:admin0pw@${caHost}:${caPort} --caname ${caName} -M ${admin0Home}/msp --tls.certfiles ${caCert}`
  await $`cp ${home}/msp/config.yaml ${admin0Home}/msp/config.yaml`
}

async function firstFile(_path: string) {
  const files = await readdir(_path)
  assert(files.length > 0)
  return path.resolve(_path, files[0])
}

await enrollOrgCA({
  host: 'bureau.edu.cn',
  port: 7051,
  caName: 'ca-bureau',
  caHost: 'localhost',
  caPort: 7054,
  kind: 'peer',
  userAffiliation: 'bureau.manager'
})
await enrollOrgCA({
  host: 'school1.edu.cn',
  port: 7061,
  caName: 'ca-school1',
  caHost: 'localhost',
  caPort: 7064,
  kind: 'peer',
  userAffiliation: 'school1.manager'
})
await enrollOrgCA({
  host: 'school2.edu.cn',
  port: 7071,
  caName: 'ca-school2',
  caHost: 'localhost',
  caPort: 7074,
  kind: 'peer',
  userAffiliation: 'school2.manager'
})
await enrollOrgCA({
  host: 'edu.cn',
  port: 7051,
  caName: 'ca-orderer',
  caHost: 'localhost',
  caPort: 7044,
  kind: 'orderer',
  userAffiliation: 'orderer.manager'
})
