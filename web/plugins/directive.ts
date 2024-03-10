import type { Directive } from 'vue'
import type { IdentityGuardBinding } from '~/types/directives'

export const DirectiveIdentityGuard: Directive<HTMLElement, IdentityGuardBinding> = (el, binding) => {
  if (process.server)
    return
  let visible = false
  const user = useSupabaseUser()
  if (user.value) {
    const identity = user.value.app_metadata.identity
    const opt = binding.value
    if ('id' in opt) {
      if (identity.identities.find(
        id => id.id === opt.id,
      ))
        visible = true
    }
    else if ('affiliation' in opt) {
      if (identity.identities.find(
        id => id.affiliation === opt.affiliation,
      ))
        visible = true
    }
    else if ('oneOfAffiliation' in opt) {
      if (identity.identities.find(
        id => opt.oneOfAffiliation.includes(id.affiliation),
      ))
        visible = true
    }
  }
  const displayBefore = Reflect.get(el, '_DirectiveIdentityGuard.display')
  if (!visible && el.style.display !== 'none') {
    Reflect.set(el, '_DirectiveIdentityGuard.display', el.style.display)
    el.style.display = 'none'
  }
  else if (el.style.display === 'none') {
    el.style.display = displayBefore
    Reflect.set(el, '_DirectiveIdentityGuard.display', undefined)
  }
}

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('identity-guard', DirectiveIdentityGuard)
})
