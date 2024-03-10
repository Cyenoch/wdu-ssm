import type { DirectiveIdentityGuard } from './plugins/directive'
import type { UserIdentity } from './types/index'

declare module '@vue/runtime-core' {
  export interface ComponentCustomProperties {
    vIdentityGuard: typeof DirectiveIdentityGuard
  }
}

declare module '@supabase/gotrue-js' {
  export interface UserAppMetadata {
    identity: UserIdentity
  }
}

export { }
