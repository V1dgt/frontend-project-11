/* eslint-disable @stylistic/quotes */
/* eslint-disable no-undef */
import createWatcher from './watcher.js'
import * as yup from 'yup'
import i18n from 'i18next'
import resources from './locales/resources.js'
import parser from './parser.js'
import axios from 'axios'
import { uniqueId } from 'lodash'

const shemaUrl = yup.string().url('url_invalid')

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

const processingFeed = (data) => {
  const { feed } = data
  const idFeed = uniqueId()
  feed.id = idFeed
  return feed
}

const processingPosts = (data, feed) => {
  const { posts } = data
  const editPosts = [...posts].map((post) => {
    const title = post.querySelector('title').textContent
    const description = post.querySelector('description').textContent
    const link = post.querySelector('link').textContent
    const idPost = uniqueId()
    const idFeed = feed.id
    const newPost = { idPost, title, description, link, idFeed }
    return newPost
  })
  return editPosts
}

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
        posts: [],
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
            const url = encodeURIComponent(`${inputUrl}`)
            const responce = axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${url}`)
            return responce
          })
          .then((responce) => {
            const parseFeedAndPosts = parser(responce.data.contents)
            const feed = processingFeed(parseFeedAndPosts)
            const posts = processingPosts(parseFeedAndPosts, feed)
            watchedState.feeds.push(feed)
            watchedState.posts.push(...posts)
          })
          .then(() => {
            watchedState.form.status = 'success'
          })
          .then(() => {
            watchedState.url = inputUrl
          })
          .then(() => {
            watchedState.form.status = 'filling'
          })
          .catch((error) => {
            const messageError = error.message.toLowerCase().replaceAll(" ", "")
            watchedState.form.status = 'error'
            watchedState.form.errors.push(i18Instance.t(messageError))
          })
      })
    })
}

export default initApp
