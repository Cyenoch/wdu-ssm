// "extends": "@adonisjs/eslint-config/app"

import antfu from '@antfu/eslint-config'

export default antfu({}, {
  files: ['packages/rest-api/*'],
  extends: '@adonisjs/eslint-config/app',
})
