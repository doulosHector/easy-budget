/**
 * Triggers a browser download for text content.
 * Returns `false` when the browser refused to create the file.
 */
export const downloadTextFile = (
  filename: string,
  data: string,
  type = 'text/csv;charset=utf-8',
): boolean => {
  try {
    const url = URL.createObjectURL(new Blob([data], { type }))
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    link.remove()
    setTimeout(() => URL.revokeObjectURL(url), 2000)
    return true
  } catch {
    return false
  }
}
