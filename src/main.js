const { TenoxUI } = __tenoxui_moxie__
const { AnyCSS } = __anyframe_css__
const ui = new TenoxUI(new AnyCSS({ colorVariant: 'rgb' }).getConfig())

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

    const childStyles = render(classes)
    childElements.forEach((childElement) => {
      childElement.style.cssText += childStyles
    })
  })
})
