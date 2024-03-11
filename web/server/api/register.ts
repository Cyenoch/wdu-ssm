import { getCAClient } from '../utils/ca-client'
import { getGatewayByOrg } from '../utils/gateway'
import { NetworkConfig } from '~/config/network-config'

const utf8Decoder = new TextDecoder()

export default defineEventHandler(async (event) => {
  const input = getQuery<{
    type: 'BureauAdmin'
    username: string
    password: string
  } | {
    type: 'Student'
    idCard: string
    password: string
    school: 'school1' | 'school2'
  }>(event)

  input.type = 'BureauAdmin'

  const _ca = getCAClient(
    input.type === 'BureauAdmin'
      ? NetworkConfig.orgs.bureau.ca
      : NetworkConfig.orgs[input.school].ca,
  )

  const _gateway = await getGatewayByOrg(event, 'bureau', 'user1')

  const network = _gateway.getNetwork(NetworkConfig.contracts.sm.channel)
  const contract = network.getContract(NetworkConfig.contracts.sm.name)

  const result = await contract.evaluateTransaction('GetStudents')
  const json = utf8Decoder.decode(result)

  return {
    students: JSON.parse(json),
  }
})
