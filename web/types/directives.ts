import type { AvailableCA } from '.'

export type IdentityGuardBinding = {
  // 要求affiliation
  affiliation: string
} | {
  // 要求至少包含某个affiliation
  oneOfAffiliation: string[]
} | {
  // 要求具有 identity id
  id: string
} | {
  ca: AvailableCA
}
