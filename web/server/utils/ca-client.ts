import path from 'node:path'
import fs from 'node:fs'
import FabricCAServices from 'fabric-ca-client'
import { User as CAUser } from 'fabric-common'
import type { ICAConfig, IOrgConfig } from '../../config/network-config'

const _cache = new Map<string, {
  caClient: FabricCAServices
  caUser: CAUser
  cert: FabricCAServices.IEnrollResponse
}>()

export async function getCAClient(
  {
    msp,
    ca: {
      pem,
      url,
      name,
      user,
      passwd,
    },
  }: IOrgConfig,
) {
  if (_cache.has(url))
    return _cache.get(url)!
  const caClient = new FabricCAServices(url, {
    trustedRoots: pem,
    verify: false,
  }, name)

  const resp = await caClient.enroll({
    enrollmentID: user,
    enrollmentSecret: passwd,
  })

  const caUser = CAUser.createUser(
    user,
    passwd,
    msp,
    resp.certificate,
    resp.key.toBytes(),
  )
  _cache.set(url, {
    caClient,
    caUser,
    cert: resp,
  })
  return _cache.get(url)!
}
