/* eslint-disable no-undef */
import createWatcher from './watcher'
import * as yup from 'yup'
import i18n from 'i18next'
import resources from './locales/ru.js'

const shemaUrl = yup.string().url('Ссылка должна быть валидным URL')

const validateUniqUrl = (url, oldUrl) => {
  if (url === oldUrl) {
    return 'url_exists'
  }
  return null
}

yup.setLocale({
  string: {
    url: 'url_invalid',
  },
})

const initApp = () => {
  const defaultLanguage = 'ru'
  const i18Instance = i18n.createInstance()
  i18Instance.init({
    lng: defaultLanguage,
    debug: false,
    resources,
  })
    .then(() => {
      const state = {
        url: '',
        form: {
          status: 'filling',
          errors: [],
        },
        feeds: [],
      }

      const watchedState = createWatcher(state, i18Instance)

      const form = document.querySelector('.rss-form')

      form.addEventListener('submit', (e) => {
        e.preventDefault()

        watchedState.form.errors = []
        watchedState.form.status = 'validiting'

        const formData = new FormData(form)
        const inputUrl = formData.get('url').trim()

        Promise.resolve()
          .then(() => shemaUrl.validate(inputUrl))
          .then(() => {
            const checkUrl = validateUniqUrl(inputUrl, watchedState.url)
            if (checkUrl) {
              throw new Error(checkUrl)
            }
          })
          .then(() => {
            watchedState.url = inputUrl
            watchedState.form.status = 'success'
          })
          .then(() => {
            watchedState.form.status = 'filling'
          })
          .catch((error) => {
            watchedState.form.status = 'error'
            watchedState.form.errors.push(i18Instance.t(error.message))
          })
      })
    })
}

export default initApp
