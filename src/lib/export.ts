import { toPng } from 'html-to-image'

export type ExportRatio = '9:16' | '16:9'

const SIZES: Record<ExportRatio, { w: number; h: number }> = {
  '9:16': { w: 1080, h: 1920 },
  '16:9': { w: 1920, h: 1080 },
}

export async function exportDashboard(contentEl: HTMLElement, ratio: ExportRatio): Promise<void> {
  const { w, h } = SIZES[ratio]

  // Build a hidden export wrapper
  const wrapper = document.createElement('div')
  wrapper.style.cssText = `
    position: fixed;
    top: -9999px;
    left: -9999px;
    width: ${w}px;
    height: ${h}px;
    background: #f0fdf4;
    overflow: hidden;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    padding: 60px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 24px;
  `

  // Header
  const header = document.createElement('div')
  header.style.cssText = 'display:flex;align-items:center;gap:12px;margin-bottom:8px;'
  header.innerHTML = `
    <span style="font-size:${ratio === '9:16' ? 56 : 48}px">🌱</span>
    <div>
      <div style="font-size:${ratio === '9:16' ? 40 : 32}px;font-weight:700;color:#15803d;">Sprout Planner</div>
      <div style="font-size:${ratio === '9:16' ? 24 : 20}px;color:#4b5563;">${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div>
    </div>
  `
  wrapper.appendChild(header)

  // Clone the content
  const clone = contentEl.cloneNode(true) as HTMLElement
  clone.style.cssText = `
    flex: 1;
    overflow: hidden;
    transform-origin: top left;
    border-radius: 24px;
    background: white;
    padding: 40px;
    box-shadow: 0 4px 32px rgba(0,0,0,0.08);
  `
  // Remove export buttons from clone
  clone.querySelectorAll('[data-export-hide]').forEach(el => el.remove())
  wrapper.appendChild(clone)

  // Footer
  const footer = document.createElement('div')
  footer.style.cssText = 'font-size:20px;color:#6b7280;text-align:center;padding-top:8px;'
  footer.textContent = `sprout-planner · ${new Date().toISOString().slice(0, 10)}`
  wrapper.appendChild(footer)

  document.body.appendChild(wrapper)

  try {
    const dataUrl = await toPng(wrapper, { width: w, height: h, pixelRatio: 1, cacheBust: true })
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `sprout-dashboard-${new Date().toISOString().slice(0, 10)}-${ratio.replace(':', 'x')}.png`
    a.click()
  } finally {
    document.body.removeChild(wrapper)
  }
}
