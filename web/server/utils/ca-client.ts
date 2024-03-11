import path from 'node:path'
import fs from 'node:fs'
import FabricCAServices from 'fabric-ca-client'
import type { ICAConfig } from '../../config/network-config'

const _cache = new Map<string, FabricCAServices>()

export function getCAClient(
  {
    pem,
    url,
    name,
  }: ICAConfig,
) {
  if (_cache.has(url))
    return _cache.get(url)!
  const caClient = new FabricCAServices(url, {
    trustedRoots: pem,
    verify: false,
  }, name)
  _cache.set(url, caClient)
  return caClient
}
