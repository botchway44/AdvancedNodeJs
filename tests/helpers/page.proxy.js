const puppeteer = require('puppeteer');
const sessionFactory = require('../factories/session.factory');
const userFactory = require('../factories/user.factory');


class CustomPage{

  static async build(){

   const browser = await puppeteer.launch({
      headless: false,
  });

  const _page = await browser.newPage();

  const customPage = new CustomPage(_page, browser);

  return new Proxy(customPage, {
    get: function(customPage, property) {
      console.log("Property",property)
      return customPage[property] || browser[property] || _page[property];
    }
  });

  }



  constructor(page, browser) {
    this.page = page;
    this.browser = browser;
  }

  async login(){
    const user = await userFactory();
    console.log(user.toString());

    const {session, sig} = await sessionFactory(user);

    await this.page.setCookie({name : "session", value : session});
    await this.page.setCookie({name : "session.sig", value : sig});

    await this.page.goto('localhost:3000');
    await this.page.waitFor('a[href="/auth/logout"]');

  }

  close() {
    this.browser.close();
  }
}


module.exports = CustomPage