import { useEffect } from 'react'

const ensureMetaTag = (attribute, value) => {
  const selector = `meta[${attribute}="${value}"]`
  let element = document.querySelector(selector)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, value)
    document.head.appendChild(element)
  }
  return element
}

const Seo = ({ title, description, image, type = 'article' }) => {
  useEffect(() => {
    if (title) {
      document.title = title
      ensureMetaTag('property', 'og:title').setAttribute('content', title)
    }

    if (description) {
      ensureMetaTag('name', 'description').setAttribute('content', description)
      ensureMetaTag('property', 'og:description').setAttribute('content', description)
    }

    if (type) {
      ensureMetaTag('property', 'og:type').setAttribute('content', type)
    }

    if (image) {
      ensureMetaTag('property', 'og:image').setAttribute('content', image)
    }
  }, [title, description, image, type])

  return null
}

export default Seo
