import puppeteer, { Browser } from "puppeteer";
let page: puppeteer.Page;
let browser: puppeteer.Browser;
let disconnectFlag = false;
let targetChangedFlag = false;
let targetCreatedFlag = false;
let targetDestroyedFlag = false;

beforeEach(async () => {
  browser = await puppeteer.launch();
});

afterEach(async () => {
  await browser.close();
});

describe("browser specific scenario", () => {
  test("Verify if browser instance works and events can be tracked", async () => {
    // Store the endpoint to be able to reconnect to Chromium
    const browserWSEndpoint = browser.wsEndpoint();
    // Disconnect puppeteer from Chromium
    browser.on("disconnected", () => {
      disconnectFlag = true;
    });
    browser.disconnect();
    // Use the endpoint to reestablish a connection
    const browser2 = await puppeteer.connect({ browserWSEndpoint });
    // Close Chromium
    browser2.on("targetchanged", () => {
      targetChangedFlag = true;
    });

    browser2.on("targetcreated", () => {
      targetCreatedFlag = true;
    });

    browser2.on("targetdestroyed", () => {
      targetDestroyedFlag = true;
    });
    page = await browser2.newPage();
    await page.goto("http://example.com", { waitUntil: "networkidle0" });
    await page.close();
    await browser2.close();
    expect(targetDestroyedFlag).toBeTruthy();
    expect(targetCreatedFlag).toBeTruthy();
    expect(disconnectFlag).toBeTruthy();
    expect(targetChangedFlag).toBeTruthy();
  });
  test("Verify browser context in incognito mode and normal mode", async () => {
    const browserContextIncognito = await browser.createIncognitoBrowserContext();
    const normalBrowserContext = await browser.defaultBrowserContext();
    expect(browserContextIncognito.isIncognito()).toBeTruthy();
    expect(normalBrowserContext.isIncognito()).toBeFalsy();
    expect(browser.isConnected()).toBeTruthy();
  });
  test("verify setting cookies works correctly", async () => {
    page = await browser.newPage();
    await page.goto("https://the-internet.herokuapp.com/", {
      waitUntil: "networkidle0",
    });
    await page.setCookie({
      value: "dummy value",
      expires: 1600321201,
      url: "https://the-internet.herokuapp.com/",
      name: "dummy name",
    });
    const cookie = await page.cookies();
    expect(cookie).toEqual(
      expect.arrayContaining([
        {
          domain: "the-internet.herokuapp.com",
          expires: 1600321201,
          httpOnly: false,
          name: "dummy name",
          path: "/",
          secure: true,
          session: false,
          size: 21,
          value: "dummy value",
        },
      ])
    );
  });
  test("verify checking chrome version", async () => {
    expect(await browser.version()).toContain("HeadlessChrome/");
  });
  test("verify checking user agent information", async () => {
    expect(await browser.userAgent()).toBeTruthy();
  });
});
