function downloadHtml(elementId, filename = 'generated.html') {
  const html = cleanHTMLAttributes(document.getElementById(elementId))
  if (!html) return

  const docHtml = `<!DOCTYPE html>
<html lang="en" style="box-sizing: border-box; margin: 0; padding: 0">
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

  console.log(docHtml)

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
