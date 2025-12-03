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
  const schemaUrl = yup.string().url('url_invalid')
  return schemaUrl.validate(url)
    .then(() => {
      if (url === oldUrl) {
        throw new Error('url_exists')
      }
    })
}

const getResponse = (url) => {
  const encodeUrl = encodeURIComponent(`${url}`)
  return axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeUrl}`)
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

const downloadingPosts = (watchedState) => {
  if (watchedState.feeds.length === 0) {
    return
  }
  const updatePromises = watchedState.feeds.map((feed) => {
    return getResponse(feed.link)
      .then(response => parser(response.data.contents, feed.link))
      .then((feedAndPosts) => {
        const newPosts = processingPosts(feedAndPosts, feed)

        console.log(newPosts)
        const existingLinks = new Set(watchedState.posts.map(p => p.link))
        const uniqueNewPosts = newPosts.filter(post => !existingLinks.has(post.link))

        if (uniqueNewPosts.length > 0) {
          watchedState.posts.push(...uniqueNewPosts)
        }
      })
      .catch(error => console.error(`Ошибка обновления ${feed.link}:`, error))
  })

  Promise.allSettled(updatePromises)
    .finally(() => setTimeout(() => downloadingPosts(watchedState), 5000))
}

const initApp = () => {
  const defaultLanguage = 'ru'
  const i18Instance = i18n.createInstance()

  i18Instance.init({
    lng: defaultLanguage,
    debug: false,
    resources,
  }).then(() => {
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
        .then(() => getResponse(inputUrl))
        .then((response) => {
          const parseFeedAndPosts = parser(response.data.contents, inputUrl)
          return parseFeedAndPosts
        })
        .then((feedAndPosts) => {
          const feed = processingFeed(feedAndPosts)
          const posts = processingPosts(feedAndPosts, feed)
          watchedState.feeds.push(feed)
          watchedState.posts.push(...posts)
          watchedState.url = inputUrl
          if (watchedState.feeds.length === 1) {
            downloadingPosts(watchedState)
          }
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
