import type { AuthError, Session, User } from '@supabase/gotrue-js'
import type { H3Error } from 'h3'
import { User as CAUser } from 'fabric-common'
import { NetworkConfig } from '~/config/network-config'
import { serverSupabaseClient, serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import type { Database } from '~/types/schema.gen'
import peers from '~/config/peers'
import { getGatewayByUser } from '~/server/utils/gateway'
import type { Student } from '~/types/cc-sm'

export default defineEventHandler(async (event) => {
  const gateway = await getGatewayByUser(event)
  const network = gateway.getNetwork(NetworkConfig.contracts.sm.channel)
  const contract = network.getContract(NetworkConfig.contracts.sm.name)

  const students = await contract.evaluateTransaction('GetStudents')
  if (!students.length)
    return []
  return decode<Student[]>(students)
})
