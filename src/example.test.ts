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

  test("check $ selector use", async () => {
    await page.goto("https://the-internet.herokuapp.com");
    const elementHandle = await page.$("h1");
    const propertyDetails = await elementHandle?.getProperty("innerText");
    const location = await elementHandle?.boundingBox();
    await elementHandle?.screenshot({ path: "hello.jpg" });
    const innerText = await propertyDetails?.jsonValue();
    expect(innerText).toEqual("Welcome to the-internet");
    expect(location).toEqual({ x: 155, y: 40.796875, width: 970, height: 61 });
  });

  test("check $$ selector use", async () => {
    await page.goto("https://the-internet.herokuapp.com");
    const elementHandles = await page.$$("li>a");
    await elementHandles[1].click();
    await page.waitForNavigation();
    const a = await page.url();
    expect(a).toEqual('https://the-internet.herokuapp.com/add_remove_elements/');
  });
});
