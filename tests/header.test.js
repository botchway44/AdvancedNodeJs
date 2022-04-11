const Page = require('./helpers/page.proxy')

test("Adds two numbers", ()=>{

    const sum = 1+2;

    expect(sum).toEqual(3);

})

let page;
beforeEach( async ()=>{
     page = await Page.build();

     await page.goto('localhost:3000');


})



afterEach(async ()=>{
    await page.close();
})


test("CHeck if header has correct text", async ()=>{
    const text  = await page.$eval('a.brand-logo', el => el.innerHTML);

    // await page.type('input[name=q]', 'puppeteer');
    expect(text).toEqual('Blogster');
   
});

test("Click to start oauth flow", async() => {

    await page.click('.right a');

    const url = await page.url();

    expect(url).toMatch(/accounts\.google\.com/);
});

test.only("When Signed In shows the logout button", (async(done) => {

   await page.login()

   const text =  await page.$eval('a[href="/auth/logout"]', el => el.innerHTML);
   expect(text).toEqual('Logout');

    done();
}), 50000)