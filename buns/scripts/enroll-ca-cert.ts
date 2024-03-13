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
    caName,
    caHost,
    caPort,
    kind
  }: {
    host: string,
    caName: `ca-${string}`,
    caHost: string,
    caPort: number,
    kind: 'peer' | 'orderer'
  }
) {
  const home = path.resolve(`../${kind}/${host}`)
  const caHome = path.resolve(`../ca/${caName.replace(/^ca-/, '')}`)

  console.info('ca home', caHome)

  const caCert = `${caHome}/ca-cert.pem`

  Bun.env['FABRIC_CA_CLIENT_HOME'] = home

  await $`mkdir -p ${home}`

  console.info(`生成CA证书 ${host}`)
  await $`fabric-ca-client enroll -u https://admin:adminpw@${caHost}:${caPort} --caname ${caName} --tls.certfiles ${caCert}`
}

await enrollOrgCA({
  host: 'bureau.edu.cn',
  caName: 'ca-bureau',
  caHost: 'localhost',
  caPort: 7054,
  kind: 'peer'
})
await enrollOrgCA({
  host: 'school1.edu.cn',
  caName: 'ca-school1',
  caHost: 'localhost',
  caPort: 7064,
  kind: 'peer'
})
await enrollOrgCA({
  host: 'school2.edu.cn',
  caName: 'ca-school2',
  caHost: 'localhost',
  caPort: 7074,
  kind: 'peer'
})
await enrollOrgCA({
  host: 'edu.cn',
  caName: 'ca-orderer',
  caHost: 'localhost',
  caPort: 7044,
  kind: 'orderer'
})
