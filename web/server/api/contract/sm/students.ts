import type { AuthError, Session, User } from '@supabase/gotrue-js'
import type { H3Error } from 'h3'
import { User as CAUser } from 'fabric-common'
import { NetworkConfig } from '~/config/network-config'
import { serverSupabaseClient, serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import type { Database } from '~/types/schema.gen'
import peers from '~/config/peers'
import { getContractByUser, getGatewayByUser } from '~/server/utils/gateway'
import type { Student } from '~/types/cc-sm'

export default defineEventHandler(async (event) => {
  const {
    size,
    bookmark,
  } = getQuery(event)

  const { contract } = await getContractByUser(event)

  const students = await contract.evaluateTransaction(
    'QueryAllStudents',
    size?.toString() ?? '20',
    bookmark?.toString() ?? '',
  )
  if (!students.length)
    return []
  return decode<{ items: Student[], bookmark: string }>(students)
})
