import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outputDir = join(root, 'public', 'hero-references')
const heroes = [
  ['sales', 'HERO-SALES-001.png'],
  ['speech', 'HERO-SPEECH-001.png'],
  ['project', 'HERO-PROJECT-001.png'],
  ['meeting', 'HERO-MEETING-001.png'],
  ['report', 'HERO-REPORT-001.png'],
  ['training', 'HERO-TRAINING-001.png'],
  ['strategy', 'HERO-STRATEGY-001.png'],
  ['budget-defense', 'HERO-BUDGET-001.png'],
]

const browserCandidates = process.platform === 'win32'
  ? [process.env.PIP_BROWSER_PATH, 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe']
  : process.platform === 'darwin'
    ? [process.env.PIP_BROWSER_PATH, '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome']
    : [process.env.PIP_BROWSER_PATH, '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser']

const browser = browserCandidates.find((candidate) => candidate && existsSync(candidate))
if (!browser) throw new Error('Chrome/Edge not found. Set PIP_BROWSER_PATH to a Chromium executable.')

mkdirSync(outputDir, { recursive: true })
for (const [scenario, filename] of heroes) {
  const source = join(root, 'tools', 'hero-references', scenario, 'index.html')
  const output = join(outputDir, filename)
  const args = [
    '--headless=new', '--no-sandbox', '--disable-gpu', '--disable-gpu-compositing', '--disable-gpu-rasterization',
    '--disable-features=Vulkan,UseSkiaRenderer,CanvasOopRasterization', '--use-angle=swiftshader', '--enable-unsafe-swiftshader',
    '--hide-scrollbars', '--allow-file-access-from-files',
    '--force-device-scale-factor=1', '--window-size=1600,900', '--run-all-compositor-stages-before-draw',
    '--virtual-time-budget=2500', `--screenshot=${output}`, pathToFileURL(source).href,
  ]
  const result = spawnSync(browser, args, { encoding: 'utf8' })
  // Chromium can return a non-zero status for host-level updater warnings after
  // writing a valid screenshot, so the generated file is the source of truth.
  if (!existsSync(output)) throw new Error(`Failed to render ${scenario}: ${result.stderr || result.stdout}`)
  console.log(`rendered: ${filename}`)
}
