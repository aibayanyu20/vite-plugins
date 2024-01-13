import mist from '@mistjs/eslint-config'

export default mist({
  vue: true,
  rules: {
    'unused-imports/no-unused-imports': 0,
    'unused-imports/no-unused-vars': 0,
  },
})
