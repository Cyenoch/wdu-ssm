import type { DirectiveIdentityGuard } from './plugins/directive'
import type { CAIdentity, ClientIdentity } from './types'

declare module '@vue/runtime-core' {

  export interface ComponentCustomProperties {
    vIdentityGuard: typeof DirectiveIdentityGuard
  }
}

declare module '@supabase/gotrue-js' {

  export interface UserAppMetadata {
    identity: ClientIdentity
    certificate: string
    key: string
    msp: string
  }
}

export { }
