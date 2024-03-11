import fs from 'node:fs'
import { NetworkConfig } from './network-config'

const peers = Object.values(NetworkConfig.orgs).map(org => ({
  name: org.name,
  msp: org.msp,
  crt: org.peer.crt,
  endpoint: org.peer.endpoint,
}))

export default peers
