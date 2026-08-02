import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const manifestPath = join(root, 'tools', 'hero-references', 'manifest.json')
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
const expectedScenarios = ['sales', 'speech', 'project', 'meeting', 'report', 'training', 'strategy', 'budget_defense']
const allowedRights = new Set(['public-domain', 'cc-by', 'cc-by-sa', 'cc-by-nc', 'explicit-permission', 'official-embed', 'link-only-no-local-copy'])
const failures = []
const hashes = new Set()

if (manifest.length !== 8) failures.push(`Expected 8 manifest records, found ${manifest.length}.`)
for (const scenario of expectedScenarios) if (!manifest.some((hero) => hero.scenario === scenario)) failures.push(`Missing scenario ${scenario}.`)

for (const hero of manifest) {
  const sourceSlug = hero.scenario === 'budget_defense' ? 'budget-defense' : hero.scenario
  const sourcePath = join(root, 'tools', 'hero-references', sourceSlug, 'index.html')
  const previewPath = join(root, 'public', 'hero-references', hero.preview)
  if (!existsSync(sourcePath)) failures.push(`Missing source ${sourcePath}.`)
  if (!existsSync(previewPath)) { failures.push(`Missing preview ${previewPath}.`); continue }
  if (!allowedRights.has(hero.rightsStatus)) failures.push(`Invalid rightsStatus for ${hero.id}.`)
  if (!hero.sourceUrl || !hero.sourceOrganization || !hero.studied || !hero.createdByPip) failures.push(`Incomplete source record for ${hero.id}.`)
  const png = readFileSync(previewPath)
  if (png.toString('ascii', 1, 4) !== 'PNG') failures.push(`${hero.preview} is not PNG.`)
  const width = png.readUInt32BE(16)
  const height = png.readUInt32BE(20)
  if (width < 1440 || height < 810 || width * 9 !== height * 16) failures.push(`${hero.preview} must be 16:9 and at least 1440×810; found ${width}×${height}.`)
  hashes.add(createHash('sha256').update(png).digest('hex'))
}

if (hashes.size !== 8) failures.push(`Expected 8 unique image hashes, found ${hashes.size}.`)
const gallery = readFileSync(join(root, 'public', 'hero-reference-review.html'), 'utf8')
for (const hero of manifest) if (!gallery.includes(hero.preview) || !gallery.includes(hero.scenario)) failures.push(`Gallery is missing ${hero.id}.`)
const productionData = readFileSync(join(root, 'public', 'data', 'references.json'), 'utf8')
if (productionData.includes('HERO-')) failures.push('Hero References must not be present in production reference data.')

if (failures.length) {
  for (const failure of failures) console.error(`hero validation: FAIL — ${failure}`)
  process.exit(1)
}
console.log('hero validation: PASS (8 sources, 8 unique 16:9 PNG previews, gallery complete, production ranking isolated).')
