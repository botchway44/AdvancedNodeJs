const Page = require('./helpers/page.proxy');

let page;

beforeEach(async () => {
  page = await Page.build();

  await page.goto('http://localhost:3000');
});


afterEach(() => {
  page.close();
});

test('Should be doing something', async () => {
  expect(2).toEqual(2);
});


describe('When Logged in', () => {

  beforeEach(async () => {
    await page.login();
    await page.goto('http://localhost:3000/blogs');

    //click on the button to move to form screen
    await page.click('a.btn-floating');
  });


  test('And can see the form', async () => {
    const title = await page.getContentsOf('form .title label') || "";
    expect(title).toEqual('Blog Title');

    const content = await page.getContentsOf('form .content label') || "";
    expect(content).toEqual('Content');
  });


  describe('When using invalid form inputs', async () => {

    beforeEach(async () => {
      //press the button without any inputs
      await page.click('form button.right');
    });


    test('Submitting shows error messages', async () => {
      const title = await page.getContentsOf('form .title .red-text') || "";
      expect(title).toEqual('You must provide a value');

      const content = await page.getContentsOf('form .content .red-text') || "";
      expect(content).toEqual('You must provide a value');
    });

  });


  describe('When using a valid form', async () => {

    beforeEach(async () => {
      //set contents for both title and content

      await page.type('form .title input', 'My title');
      await page.type('form .content input', 'My Content');

      await page.click('form button.right');
    });


    test('Submitting takes user to a review screen ', async () => {
      const text = await page.getContentsOf('form h5') || "";
      expect(text).toEqual('Please confirm your entries');
    });


    // test('Submitting then saving adds blog to my blogs', async () => {

    // });

  });

});