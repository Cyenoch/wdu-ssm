import peers from '~/config/peers'

export default defineEventHandler((_event) => {
  return peers.map(peer => ({
    name: peer.name,
    msp: peer.msp,
    endpoint: peer.endpoint,
  }))
})
