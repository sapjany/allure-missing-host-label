// Workaround: uncomment the two lines below to fix the missing host label.
// import { hostname } from 'node:os'
// process.env['ALLURE_LABEL_host'] = hostname()

export const config = {
  runner: 'local',
  specs: ['./test/reproduction.test.js'],
  maxInstances: 1,
  capabilities: [{
    browserName: 'chrome',
    'goog:chromeOptions': {
      args: ['--headless=new']
    }
  }],
  logLevel: 'warn',
  framework: 'mocha',
  reporters: [
    'spec',
    ['allure', {
      outputDir: 'allure-results',
      disableWebdriverStepsReporting: true,
      disableWebdriverScreenshotsReporting: true
    }]
  ],
  mochaOpts: {
    ui: 'bdd',
    timeout: 10_000
  }
}
