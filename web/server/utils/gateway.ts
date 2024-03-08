import fs from 'node:fs'
import path from 'node:path'
import type Buffer from 'node:buffer'
import * as crypto from 'node:crypto'
import * as grpc from '@grpc/grpc-js'
import type { Gateway } from '@hyperledger/fabric-gateway'
import { Contract, Identity, Signer, connect, signers } from '@hyperledger/fabric-gateway'
import { type IOrgConfig, type IPeerConfig, NetworkConfig, type Orgs } from '~/config/network-config'

const utf8Decoder = new TextDecoder()
const _cache = new Map<string, Gateway>()

// Server only
export async function getGatewayByOrg(_org: Orgs, user: 'user1' = 'user1') {
  const cacheKey = `${_org}-${user}`
  if (_cache.has(cacheKey))
    return _cache.get(cacheKey)!
  const org = NetworkConfig.orgs[_org]
  const gateway = await getGateway(
    org.peer.endpoint,
    fs.readFileSync(org.peer.crt),
    org.msp,
    readFirstDirFile(org.users[user].signcerts),
    readFirstDirFile(org.users[user].keystore),
  )
  _cache.set(cacheKey, gateway)
  return gateway
}

export async function getGateway(endpoint: string, peerCrt: Buffer, mspId: string, credentials: Buffer, keystore: Buffer) {
  const tlsCred = grpc.credentials.createSsl(peerCrt)
  const _grpc = new grpc.Client(endpoint, tlsCred, {
  })
  const identity = {
    mspId,
    credentials,
  }
  const signer = signers.newPrivateKeySigner(
    crypto.createPrivateKey(keystore),
  )
  const gateway = connect({
    client: _grpc,
    identity,
    signer,
  })
  return gateway
}

export async function getNetwork(org: Orgs, channel: string, user: 'user1' = 'user1') {
  const gateway = (await getGatewayByOrg(org, user))
  return {
    gateway,
    network: gateway.getNetwork(channel),
  }
}

export async function getContract(org: Orgs, channel: string, contract: string, user: 'user1' = 'user1') {
  const result = (await getNetwork(org, channel, user))
  return {
    ...result,
    contract: result.network.getContract(contract),
  }
}

export function decode<T>(u8a: Uint8Array): T {
  return JSON.parse(utf8Decoder.decode(u8a)) as T
}

function readFirstDirFile(_path: string): Buffer {
  const files = fs.readdirSync(_path)
  return fs.readFileSync(path.join(_path, files[0]))
}
