/* eslint-disable no-undef */
import onChange from 'on-change'

const createWatcher = (state, i18n) => {
  const watchedState = onChange(state, () => {
    updateUi(watchedState, i18n)
  })
  return watchedState
}

const updateUi = (state, i18n) => {
  const feedback = document.querySelector('.feedback')
  const input = document.getElementById('url-input')
  const buttonSubmit = document.querySelector('button[type="submit"]')

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
      buttonSubmit.classList.remove('disabled')
      input.classList.remove('is-invalid')
      feedback.classList.remove('text-danger')
      feedback.classList.add('text-success')
      feedback.textContent = i18n.t('success')
      input.value = ''
      input.focus()
      break
    default:
      throw new Error(`Unknown status: ${state.form.status}`)
  }
}

export default createWatcher
