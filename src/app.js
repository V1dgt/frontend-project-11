/* eslint-disable @stylistic/quotes */
/* eslint-disable no-undef */
import createWatcher from './watcher.js'
import * as yup from 'yup'
import i18n from 'i18next'
import resources from './locales/resources.js'
import parser from './parser.js'
import axios from 'axios'
import { uniqueId } from 'lodash'

const validateUrl = (url, oldUrl) => {
  const shemaUrl = yup.string().url('url_invalid')
  return shemaUrl.validate(url)
    .then(() => {
      if (url === oldUrl) {
        throw new Error('url_exists')
      }
    })
}

const getResponce = (url) => {
  const encodeUrl = encodeURIComponent(`${url}`)
  const responce = axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeUrl}`)
  return responce
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

const downloadingPosts = (state) => {
  const updatePosts = state.feeds.map((feed) => {
    getResponce(feed.link)
      .then((responce) => {
        const parseFeedAndPosts = parser(responce.data.contents, feed.link)
        return parseFeedAndPosts
      })
      .then((feedAndPosts) => {
        const posts = processingPosts(feedAndPosts, feed)

        const oldPosts = state.posts.filter(post => post.idFeed !== feed.id)
        state.posts = [...oldPosts, ...posts]
      })
      .catch(error => console.log(`Не удалось обновить фид: ${error}`))
  })

  Promise.all(updatePosts)
    .then(() => setTimeout(downloadingPosts(state), 5000))
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

        validateUrl(inputUrl, watchedState.url)
          .then(() => getResponce(inputUrl))
          .then((responce) => {
            const parseFeedAndPosts = parser(responce.data.contents, inputUrl)
            return parseFeedAndPosts
          })
          .then((feedAndPosts) => {
            const feed = processingFeed(feedAndPosts)
            const posts = processingPosts(feedAndPosts, feed)
            watchedState.feeds.push(feed)
            watchedState.posts.push(...posts)
          })
          .then(() => {
            watchedState.url = inputUrl
          })
          .then(() => {
            downloadingPosts(watchedState)
          })
          .then(() => {
            watchedState.form.status = 'success'
          })
          .catch((error) => {
            const messageError = error.message.toLowerCase().replaceAll(" ", "")
            watchedState.form.status = 'error'
            watchedState.form.errors.push(i18Instance.t(messageError))
          })
          .finally(() => {
            watchedState.form.status = 'filling'
          })
      })
    })
}

export default initApp
