import fs from 'node:fs'
import path from 'node:path'
import * as crypto from 'node:crypto'
import type { H3Event } from 'h3'
import * as grpc from '@grpc/grpc-js'
import type { Gateway } from '@hyperledger/fabric-gateway'
import { Contract, Identity, Signer, connect, signers } from '@hyperledger/fabric-gateway'
import { type IOrgConfig, type IPeerConfig, NetworkConfig, type Orgs } from '~/config/network-config'
import { serverSupabaseUser } from '#supabase/server'
import type { Peer } from '~/types'
import peers from '~/config/peers'

const utf8Decoder = new TextDecoder()
const _cache = new Map<string, Gateway>()

// Server only
export async function getGatewayByOrg(event: H3Event, _org: Orgs, user: 'user0' = 'user0') {
  const cacheKey = `${_org}-${user}`
  if (_cache.has(cacheKey))
    return _cache.get(cacheKey)!
  const org = NetworkConfig.orgs[_org]

  const gateway = await getGateway(
    {
      name: org.name,
      msp: org.msp,
      crt: org.peer.crt,
      endpoint: org.peer.endpoint,
    },
    org.users[user].signcerts,
    org.users[user].keystore,
  )
  _cache.set(cacheKey, gateway)
  return gateway
}

export async function getGatewayByUser(event: H3Event) {
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({
      status: 403,
      message: '未登录',
    })
  }
  const peer = peers.find(peer => peer.msp === user.app_metadata.msp)!
  console.info(`using peer: ${peer.endpoint}`)
  const gateway = getGateway(
    peer,
    Buffer.from(user.app_metadata.certificate, 'utf-8'),
    Buffer.from(user.app_metadata.key, 'utf-8'),
  )
  return gateway
}

export async function getGateway(peer: Peer, credentials: Buffer, keystore: Buffer) {
  const tlsCred = grpc.credentials.createSsl(peer.crt)
  const _grpc = new grpc.Client(peer.endpoint, tlsCred, {
  })
  const identity = {
    mspId: peer.msp,
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

export async function getNetwork(event: H3Event, org: Orgs, channel: string, user: 'user0' = 'user0') {
  const gateway = (await getGatewayByOrg(event, org, user))
  return {
    gateway,
    network: gateway.getNetwork(channel),
  }
}

export async function getContract(event: H3Event, org: Orgs, channel: string, contract: string, user: 'user0' = 'user0') {
  const result = (await getNetwork(event, org, channel, user))
  return {
    ...result,
    contract: result.network.getContract(contract),
  }
}

export async function getContractByUser(event: H3Event) {
  const gateway = await getGatewayByUser(event)
  const network = gateway.getNetwork(NetworkConfig.contracts.sm.channel)
  const contract = network.getContract(NetworkConfig.contracts.sm.name)
  return {
    gateway,
    network,
    contract,
  }
}

export function decode<T>(u8a: Uint8Array): T {
  return JSON.parse(utf8Decoder.decode(u8a)) as T
}
