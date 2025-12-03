/* eslint-disable*/
import config from 'config'
import puppeteer from 'puppeteer'

class Octopussy {
  get server() {
    if (this._server) {
      return this._server
    }
    throw new Error('Server not started yet')
  }
  get origin() {
    if (this._origin) {
      return this._origin
    }
    throw new Error('Origin not set yet')
  }
  get browser() {
    if (this._browser) {
      return this._browser
    }
    throw new Error('Browser not started yet')
  }
  /**
   * Returns multiple device resolutions
   */
  static get device() {
    return {
      iPhone8Plus: {height: 736, width: 414, isMobile: true},
      iPhone5: {height: 568, width: 320, isMobile: true},
      desktop: {height: 677, width: 1368, isMobile: false}
    }
  }
  /**
   * Returns multiple userAgents
   */
  static get userAgents() {
    return {
      standardMobile:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 10_2_1 like Mac OS X) AppleWebKit/602.4.6 (KHTML, like Gecko) Version/10.0 Mobile/14D27 Safari/602.1',
      standardDesktop:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36'
    }
  }
  public static _started: any
  public static _usageCount: any
  public static __instance: any
  /**
   * Check if its a valid GraphQL query
   * @param {string} name
   * @returns {(req: Request) => any}
   */
  public static isGraphQLQuery(name) {
    return (req) =>
      req.url().match(/\/graphql/) &&
      (req.method() === 'OPTIONS' ||
        (req.postData() && JSON.parse(req.postData()).query.match(name)))
  }
  public _server: any
  public start: any
  public app: any
  public _browser: any
  public _origin: string
  public stop: any
  constructor(app: any) {
    this.app = app
    this.start = async () => {
      if (!Octopussy._started) {
        const [server, browser] = await Promise.all([
          await this.createServer(),
          await this.createBrowser()
        ])
        this._server = server
        this._browser = browser
        this._origin = `http://localhost:${this._server.address().port}/msd`
      }
      Octopussy._started = true
    }
    this.stop = () => {
      Octopussy._usageCount--
      if (Octopussy._usageCount === 0) {
        Octopussy._started = false
        return Promise.all([
          new Promise((resolve) => this._server.close(resolve)),
          this._browser.close()
        ])
      }
    }
    Octopussy._usageCount++
    if (Octopussy.__instance) {
      return Octopussy.__instance
    }
    Octopussy.__instance = this
  }
  public createServer() {
    return new Promise((resolve) => {
      const server = this.app.listen(0, () => resolve(server))
    })
  }
  public createBrowser = () =>
    puppeteer.launch({
      headless: true,
      slowMo: 0,
      args: [
        `--enable-features=NetworkService`,
        '--no-sandbox',
        '--disable-web-security',
        '--disable-dev-shm-usage'
      ]
    })

  public async newPage() {
    const page = await this.browser.newPage()
    await page.setViewport(Octopussy.device.desktop)
    // const extension = PageExtensions(this, page)
    return page
  }
}
Octopussy._usageCount = 0
Octopussy._started = false
// exports.Octopussy = Octopussy

export default Octopussy

/* eslint-enable */
