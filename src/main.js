const { TenoxUI } = __tenoxui_moxie__
const { properties, values, classes, colorLib, AnyCSS } = __anyframe_css__

const ui = new TenoxUI({
  property: properties({ sizing: 0.25 }),
  values: { ...colorLib({ output: 'rgb' }), ...values },
  classes: {
    ...classes,
    flexDirection: {
      'flex-col': 'column'
    }
  }
})

function formatRules(cssRules, value) {
  if (Array.isArray(cssRules) && value !== null) {
    return cssRules
      .map((prop) =>
        value ? `${ui.toKebabCase(String(prop))}: ${value}` : ui.toKebabCase(String(prop))
      )
      .join('; ')
  }

  return cssRules
}

function generate(item) {
  const { cssRules, value, prefix } = item
  if (prefix) return
  const rules = formatRules(cssRules, value)
  const finalValue = Array.isArray(cssRules) || value === null ? '' : `: ${value}`
  return rules + finalValue + ';'
}

function render(classNames) {
  return ui
    .process(classNames)
    .map((item) => generate(item))
    .join('\n')
}

function scanAndProcessClasses() {
  document.querySelectorAll('*').forEach((element) => {
    if (element.classList && element.classList.length > 0)
      Array.from(element.classList).forEach(
        (className) => (element.style.cssText += render(className))
      )
  })
}

function parseAttributeContent(content) {
  const result = {}
  const rules = content.split(';').filter((rule) => rule.trim() !== '')

  rules.forEach((rule) => {
    const match = rule.match(/\(\s*([^)]+)\s*\)\s*:\s*(.+)/)
    if (match) {
      const selector = match[1].trim()
      const classes = match[2].trim()
      result[selector] = classes
    }
  })

  return result
}

document.querySelectorAll('[_]').forEach((element) => {
  const attrContent = element.getAttribute('_')
  if (!attrContent) return

  const styleRules = parseAttributeContent(attrContent)

  Object.entries(styleRules).forEach(([childSelector, classes]) => {
    const childElements = element.querySelectorAll(childSelector)
    if (childElements.length === 0) {
      return
    }

    childElements.forEach((childElement) => {
      childElement.style.cssText += render(classes)
    })
  })
})

scanAndProcessClasses() // initialize styles

const htmlEditor = document.getElementById('htmlEditor')
const output = document.getElementById('output')
const copyHTML = document.getElementById('copyHTML')

function applyStyling() {
  document.querySelectorAll('#output *').forEach((element) => {
    if (element.classList.length > 0) {
      Array.from(element.classList).forEach(
        (className) => (element.style.cssText += render(className))
      )
    }
  })
}

function updateOutput(html) {
  output.innerHTML = html
  applyStyling()
}

htmlEditor.value = `
<div class="size-48 bg-neutral-950 text-white radius-xl flex items-center justify-center">
  Hello World!
</div>`
updateOutput(htmlEditor.value)

htmlEditor.addEventListener('input', () => {
  updateOutput(htmlEditor.value)
})

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

function cleanHTMLAttributes(element) {
  if (!element || element.nodeType !== Node.ELEMENT_NODE) return ''

  const cleanedElement = element.cloneNode(true)

  function cleanAttributes(node) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      Array.from(node.attributes).forEach((attr) => {
        if (!PRESERVED_ATTRIBUTES.includes(attr.name)) {
          node.removeAttribute(attr.name)
        }
      })
    }

    node.childNodes.forEach(cleanAttributes)
  }

  cleanAttributes(cleanedElement)

  return cleanedElement.innerHTML
}

copyHTML.addEventListener('click', () => {
  console.log(cleanHTMLAttributes(output))
  navigator.clipboard.writeText(cleanHTMLAttributes(output))
})
