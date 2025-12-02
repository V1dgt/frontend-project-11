/* eslint-disable no-undef */
const parser = (rssString, link) => {
  const domParser = new DOMParser()
  const doc = domParser.parseFromString(rssString, 'application/xml')
  const errorNode = doc.querySelector('parsererror')
  if (errorNode) {
    throw new Error('parse_error')
  }
  else {
    const title = doc.querySelector('channel > title').textContent
    const description = doc.querySelector('channel > description').textContent
    const feed = { title, description, link }
    const posts = doc.querySelectorAll('item')
    const feedAndPosts = { feed, posts }
    return feedAndPosts
  }
}

export default parser
