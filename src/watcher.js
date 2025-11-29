/* eslint-disable no-undef */
import onChange from 'on-change'

const renderFeeds = (feeds, i18n) => {
  const containerFeeds = document.querySelector('.feeds')
  containerFeeds.textContent = ''

  const card = document.createElement('div')
  card.classList.add('card', 'border-0')
  const cardBody = document.createElement('div')
  cardBody.classList.add('card-body')
  const cardTitle = document.createElement('div')
  cardTitle.classList.add('card-title', 'h4')

  containerFeeds.append(card)
  card.append(cardBody)
  cardBody.append(cardTitle)
  cardTitle.textContent = i18n.t('other_words.feeds')

  const ul = document.createElement('ul')
  ul.classList.add('list-group', 'border-0', 'rounded-0')

  feeds.map((feed) => {
    const title = feed.title
    const description = feed.description

    const li = document.createElement('li')
    li.classList.add('list-group-item', 'border-0', 'border-end-0')
    const h3 = document.createElement('h3')
    h3.classList.add('h6', 'm-0')
    const p = document.createElement('p')
    p.classList.add('m-0', 'small', 'text-black-50')

    h3.textContent = title
    p.textContent = description

    ul.append(li)
    li.append(h3)
    li.append(p)
  })

  containerFeeds.append(ul)
}

const renderPosts = (posts, i18n) => {
  const containerPosts = document.querySelector('.posts')
  containerPosts.textContent = ''

  const card = document.createElement('div')
  card.classList.add('card', 'border-0')
  const cardBody = document.createElement('div')
  cardBody.classList.add('card-body')
  const cardTitle = document.createElement('div')
  cardTitle.classList.add('card-title', 'h4')

  containerPosts.append(card)
  card.append(cardBody)
  cardBody.append(cardTitle)
  cardTitle.textContent = i18n.t('other_words.posts')

  const ul = document.createElement('ul')
  ul.classList.add('list-group', 'border-0', 'rounded-0')

  posts.map((post) => {
    const title = post.title
    const link = post.link

    const li = document.createElement('li')
    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0')
    const a = document.createElement('a')
    a.classList.add('fw-bold')
    a.setAttribute('href', link)
    a.setAttribute('target', '_blank')
    a.setAttribute('rel', 'noopener noreferrer')
    a.dataset.id = '149'

    const button = document.createElement('button')
    button.setAttribute('type', 'button')
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm')
    button.dataset.id = '149'
    button.setAttribute('data-bs-toggle', 'modal')
    button.setAttribute('data-bs-target', '#modal')

    a.textContent = title
    button.textContent = i18n.t('other_words.viewing')

    ul.append(li)
    li.append(a)
    li.append(button)
  })
  containerPosts.append(ul)
}

const updateUi = (state, i18n) => {
  const feedback = document.querySelector('.feedback')
  const input = document.getElementById('url-input')
  const buttonSubmit = document.querySelector('button[type="submit"]')
  const feeds = state.feeds
  const posts = state.posts

  switch (state.form.status) {
    case 'filling':
      buttonSubmit.classList.remove('disabled')
      input.focus()
      break
    case 'validiting':
      buttonSubmit.classList.add('disabled')
      break
    case 'error':
      buttonSubmit.classList.remove('disabled')
      input.classList.add('is-invalid')
      feedback.classList.remove('text-success')
      feedback.classList.add('text-danger')
      feedback.textContent = i18n.t(`errors.${state.form.errors[0]}`)
      break
    case 'success':
      renderFeeds(feeds, i18n)
      renderPosts(posts, i18n)
      buttonSubmit.classList.remove('disabled')
      input.classList.remove('is-invalid')
      feedback.classList.remove('text-danger')
      feedback.classList.add('text-success')
      feedback.textContent = i18n.t('other_words.success')
      input.value = ''
      input.focus()
      break
    default:
      throw new Error(`Unknown status: ${state.form.status}`)
  }
}

const createWatcher = (state, i18n) => {
  const watchedState = onChange(state, () => {
    updateUi(watchedState, i18n)
  })
  return watchedState
}

export default createWatcher
