import { readFileSync, readdirSync } from 'node:fs'

const results = readdirSync('./allure-results')
  .filter(f => f.endsWith('-result.json'))
  .map(f => JSON.parse(readFileSync(`./allure-results/${f}`, 'utf8')))

if (results.length === 0) {
  console.error('No result files found in ./allure-results — run npm test first.')
  process.exit(1)
}

const withHost   = results.filter(r => r.labels?.some(l => l.name === 'host'))
const withThread = results.filter(r => r.labels?.some(l => l.name === 'thread'))

console.log(`Results:  ${results.length}`)
console.log(`  with "host" label:   ${withHost.length}`)
console.log(`  with "thread" label: ${withThread.length}`)

if (withHost.length === 0) {
  console.error('\nBUG REPRODUCED: "host" label is absent from all result files.')
  console.error('The Allure timeline view will be empty.')
  process.exit(1)
} else {
  console.log('\nOK: "host" label is present.')
}
