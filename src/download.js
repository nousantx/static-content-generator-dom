const PRESERVED_ATTRIBUTES = [
  'style',
  'xmlns',
  'width',
  'height',
  'viewBox',
  'd',
  'fill',
  'path',
  'id',
  'x1',
  'x2',
  'y1',
  'y2',
  'gradientUnits',
  'gradientTransform',
  'offset',
  'stop-color',
  'opacity',
  'href',
  'stroke',
  'stroke-linecap',
  'stroke-linejoin',
  'stroke-width'
]

function scanAndProcessClasses() {
  const allElements = document.querySelectorAll('*')
  const processedRules = new Set()

  allElements.forEach((element) => {
    if (element.classList && element.classList.length > 0) {
      const classes = Array.from(element.classList)
      classes.forEach((className) => {
        const cssRules = render(className)
        console.log(element.classList)
        if (cssRules && !processedRules.has(cssRules)) {
          processedRules.add(cssRules)
          element.style.cssText += cssRules
        }
      })
    }
  })
}

scanAndProcessClasses()

function generateCleanHtml(elementId) {
  // Process all classes first
  scanAndProcessClasses()

  const targetElement = document.getElementById(elementId)
  if (!targetElement) {
    console.error(`Element with ID "${elementId}" not found.`)
    return null
  }

  const clonedElement = targetElement.cloneNode(true)

  function cleanElement(element) {
    const preservedAttrs = {}
    for (const attr of element.attributes) {
      if (
        PRESERVED_ATTRIBUTES.includes(attr.name) ||
        (element.tagName.toLowerCase() === 'svg' && attr.name.startsWith('svg:'))
      ) {
        preservedAttrs[attr.name] = attr.value
      }
    }

    // Remove all attributes
    while (element.attributes.length > 0) {
      element.removeAttribute(element.attributes[0].name)
    }

    // Restore preserved attributes
    for (const [name, value] of Object.entries(preservedAttrs)) {
      element.setAttribute(name, value)
    }

    // Process children recursively
    Array.from(element.children).forEach(cleanElement)
  }

  cleanElement(clonedElement)
  return clonedElement.outerHTML
}

function downloadHtml(elementId, filename = 'generated.html') {
  const html = generateCleanHtml(elementId)
  if (!html) return

  const docHtml = `<!DOCTYPE html>
<html lang="en"style="box-sizing: border-box; margin: 0; padding: 0">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Style by AnyFrame & TenoxUI</title>
</head>
<body style="box-sizing: border-box; margin: 0; padding: 0">
  ${html}
</body>
</html>`

  const blob = new Blob([docHtml], { type: 'text/html' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()

  setTimeout(() => {
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, 100)

  return html
}
