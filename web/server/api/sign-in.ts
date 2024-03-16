import type { AuthError, AuthResponse, Session, User } from '@supabase/gotrue-js'
import type { H3Error } from 'h3'
import { User as CAUser } from 'fabric-common'
import { NetworkConfig } from '~/config/network-config'
import { serverSupabaseClient, serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import type { Database } from '~/types/schema.gen'
import type { AvailableMSP } from '~/types'

export default defineEventHandler<{
  query: {
    msp: AvailableMSP
    username: string
    password: string
  }
}, Promise<AuthResponse['data'] | User | Session | H3Error>>(async (event) => {
  const supaService = serverSupabaseServiceRole<Database>(event)
  const supa = await serverSupabaseClient<Database>(event)
  const input = getQuery(event)
  const { username, password } = input
  const config = Object.values(NetworkConfig.orgs).find(org => org.msp === input.msp)
  if (!config)
    throw createError('MSP Not exists')
  const email = `${username}@${config.domain}`

  // 如果当前已经登录,则返回当前登录的信息
  const user = await serverSupabaseUser(event)
  if (user?.id)
    return user

  console.info('get ca client')

  // supabase中没有用户信息,需要enroll获取证书和私钥
  const { caClient, caUser } = await getCAClient(config)

  const cert = await caClient.enroll({
    enrollmentID: username,
    enrollmentSecret: password,
  })

  console.info('get affiliation and identity')

  const identity = await caClient.newIdentityService().getOne(username, caUser)

  if (!identity.success)
    return createError(`获取CA Identity失败: ${identity.messages}`)

  const userId = await supaService.rpc('get_user_id_by_email', { user_email: email })
  if (!userId.data) {
    // 在supabase中创建用户
    const userResponse = await supaService.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      app_metadata: {
        msp: config.msp,
        certificate: cert.certificate,
        key: cert.key.toBytes(),
        identity: identity.result,
      },
    })

    if (userResponse.error) {
      console.warn(userResponse.error)
      return createError(`创建用户信息失败: ${userResponse.error.message}`)
    }
  }
  else {
    await supaService.auth.admin.updateUserById(userId.data, {
      app_metadata: {
        msp: config.msp,
        certificate: cert.certificate,
        key: cert.key.toBytes(),
        identity: identity.result,
      },
    })
  }

  const signInResult = await supa.auth.signInWithPassword({
    email,
    password,
  })
  if (signInResult && signInResult.data.session) {
    // const sess = signInResult.data.session!
    return signInResult.data.session
  }

  console.warn(signInResult)
  return createError(`登录失败: ${JSON.stringify(signInResult.error?.message)}`)
})
