import puppeteer from "puppeteer";
import { openBrowser, openPage, textBySelector } from "./helper";

let browser: puppeteer.Browser;
let page: puppeteer.Page;
const pageName = "/";
let viewport = {
  width: 1280,
  height: 980,
  deviceScaleFactor: 1,
};

beforeEach(async () => {
  browser = await openBrowser();
  page = await openPage(browser, pageName);
  await page.setViewport(viewport);
});

afterEach(async () => {
  if (browser) {
    browser.close();
  }
});

describe.only("Example Test Scenarios", () => {
  test("check if page title is correct", async () => {
    const title = await page.title();
    expect(title).toEqual("The Internet");
  });

  test("check if basic authentication works", async () => {
    await page.setExtraHTTPHeaders({
      Authorization: `Basic ${Buffer.from("admin:admin").toString("base64")}`,
    });
    await page.goto((await page.url()) + "/basic_auth");
    const successMessage = await textBySelector(page, ".example p");
    expect(successMessage.trim()).toEqual(
      "Congratulations! You must have the proper credentials."
    );
  });

  test("check if basic authentication works using page.authenticate  ", async () => {
    await page.authenticate({ username: "admin", password: "admin" });
    await page.goto((await page.url()) + "/basic_auth");
    const successMessage = await textBySelector(page, ".example p");
    expect(successMessage.trim()).toEqual(
      "Congratulations! You must have the proper credentials."
    );
  });

  test("check if window width and height is correct on opening", async () => {
    const dimensions = await page.evaluate(() => {
      return {
        width: document.documentElement.clientWidth,
        height: document.documentElement.clientHeight,
        deviceScaleFactor: window.devicePixelRatio,
      };
    });
    expect(dimensions).toEqual(viewport);
  });

  test("check page.$ selector use", async () => {
    await page.goto("https://the-internet.herokuapp.com");
    const elementHandle = await page.$("h1");
    const propertyDetails = await elementHandle?.getProperty("innerText");
    const location = await elementHandle?.boundingBox();
    await elementHandle?.screenshot({ path: "hello.jpg" });
    const innerText = await propertyDetails?.jsonValue();
    expect(innerText).toEqual("Welcome to the-internet");
    expect(location).toEqual({ x: 155, y: 40.796875, width: 970, height: 61 });
  });

  test("check page.$$ selector use", async () => {
    await page.goto("https://the-internet.herokuapp.com");
    const elementHandles = await page.$$("li>a");
    await elementHandles[1].click();
    await page.waitForNavigation();
    const a = await page.url();
    expect(a).toEqual('https://the-internet.herokuapp.com/add_remove_elements/');
  });

  test("check page.eval$$ selector use", async () => {
    await page.goto("https://the-internet.herokuapp.com");
    const hrefs = await page.$$eval('li>a', elements => elements.map(element => element.getAttribute('href')));
    console.log(hrefs);
  });

  test("check page.eval$ selector use", async () => {
    await page.goto("https://the-internet.herokuapp.com");
    const style = await page.$eval('a>img', element => element.getAttribute('style'));
    console.log(style);
  });

  test("check page.$x use", async () => {
    await page.goto("https://the-internet.herokuapp.com");
    const element = await page.$x('//h1');//use of xpath instead of selectors
    const text = await element[0].getProperty('textContent');
    const json = await text.jsonValue();
    console.log(json);
  });

  test("check if adding script tag works", async () => {
    var projectDir = process.env.PWD;
    await page.goto(`file:///${projectDir}/src/1.html`);
    await page.addScriptTag({
      content:"document.getElementById(\"demo\").innerHTML =\"I Love You\";"
    })
    const headline = await page.$eval('h1', element => element.textContent);
    expect(headline).toEqual('I Love You');
   });

   test("check if adding style works", async () => {
    var projectDir = process.env.PWD;
    await page.goto(`file:///${projectDir}/src/1.html`);
    await page.addStyleTag({
      url:`file:///${projectDir}/src/1.css`
    })
    const styleObject = await page.evaluate(
      () => {
        const headline:any = document.querySelector('h1');
        return JSON.parse(JSON.stringify(getComputedStyle(headline)));
      });
    expect(styleObject.fontSize).toEqual('25px');
   });
});
