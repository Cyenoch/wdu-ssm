import type { AuthError, Session, User } from '@supabase/gotrue-js'
import type { H3Error } from 'h3'
import { User as CAUser } from 'fabric-common'
import { NetworkConfig } from '~/config/network-config'
import { serverSupabaseClient, serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import type { Database } from '~/types/schema.gen'

export type UpdateUserInput = {
  type: 'Bureau'
  email: string
  secret: string
} | {
  type: 'School'
  email: string
  secret: string
  school: 'school1' | 'school2'
}

export default defineEventHandler(async (event) => {
  const supa = serverSupabaseServiceRole<Database>(event)
  const input: UpdateUserInput = getQuery(event)
  // TODO:
  if (input.secret !== useRuntimeConfig(event).app.secret)
    return createError('invalid secret')

  const config = input.type === 'Bureau'
    ? NetworkConfig.orgs.bureau
    : NetworkConfig.orgs[input.school]

  // supabase中没有用户信息,需要enroll获取证书和私钥
  const _ca = getCAClient(config.ca)

  const userId = await supa.rpc('get_user_id_by_email', { user_email: input.email })
  if (!userId.data) {
    return createError('user not exists')
  }
  else {
    const response = await supa.auth.admin.getUserById(userId.data)
    if (!response.data.user)
      return createError('get user failed.')
    const user = response.data.user
    const caUser = CAUser.createUser(
      user.email!,
      '// TODO',
      config.msp,
      user.app_metadata.certificate,
      user.app_metadata.key,
    )
    const caInfo = await _ca.getCaInfo(caUser)
    const affiliation = await _ca.newAffiliationService().getAll(caUser)
    const identity = await _ca.newIdentityService().getAll(caUser)
    if (!affiliation.success)
      return createError(`获取Affiliation失败: ${affiliation.messages}`)
    if (!identity.success)
      return createError(`获取CA Identity失败: ${identity.messages}`)

    return await supa.auth.admin.updateUserById(userId.data, {
      app_metadata: {
        msp: config.msp,
        caName: caInfo.caName,
        caChain: caInfo.caChain,
        identity: identity.result,
        affiliation: affiliation.result,
      },
    })
  }
})
