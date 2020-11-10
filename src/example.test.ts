import puppeteer from "puppeteer";
import { openBrowser, openPage} from "./helper";

let browser: puppeteer.Browser;
let page: puppeteer.Page;
const viewport = {
  width: 1280,
  height: 980,
  deviceScaleFactor: 1,
};

beforeAll(async () => {
  browser = await openBrowser();
  page = await openPage(browser);
  await page.setViewport(viewport);
});

afterAll(async () => {
  if (browser) {
    browser.close();
  }
});

describe("Example Test Scenarios", () => {
  test("check if page title is correct", async () => {
    const title = await page.title();
    expect(title).toEqual("The Internet");
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

  test("check page.$ selector,", async () => {
    await page.goto("https://the-internet.herokuapp.com");
    const elementHandle = await page.$("h1");
    const propertyDetails = await elementHandle?.getProperty("innerText");
    const location = await elementHandle?.boundingBox();
    await elementHandle?.screenshot({ path: "hello.jpg" });
    const innerText = await propertyDetails?.jsonValue();
    expect(innerText).toEqual("Welcome to the-internet");
    expect(location).toEqual({ x: 155, y: 40.796875, width: 970, height: 61 });
    await page.$("h1").then(async (s) => {
      expect(await (await s?.getProperty("innerText"))?.jsonValue()).toEqual(
        "Welcome to the-internet"
      );
    });
  });

  test("check page.$$ selector use", async () => {
    await page.goto("https://the-internet.herokuapp.com");
    const elementHandles = await page.$$("li>a");
    await elementHandles[1].click();
    await page.waitForNavigation();
    const a = await page.url();
    expect(a).toEqual(
      "https://the-internet.herokuapp.com/add_remove_elements/"
    );
  });

  test("check page.eval$$ selector use", async () => {
    await page.goto("https://the-internet.herokuapp.com");
    const hrefs = await page.$$eval("li>a", (elements) =>
      elements.map((element) => element.getAttribute("href"))
    );
    hrefs.forEach((a) => {
      expect(a).toContain("/");
    });
  });

  test("check page.eval$ selector use", async () => {
    await page.goto("https://the-internet.herokuapp.com");
    const style = await page.$eval("a>img", (element) =>
      element.getAttribute("style")
    );
    expect(style).toContain("absolute");
    expect(style).toContain("top: 0");
  });

  test("check page.$x use", async () => {
    await page.goto("https://the-internet.herokuapp.com");
    const element = await page.$x("//h1"); //use of xpath instead of selectors
    const text = await element[0].getProperty("textContent");
    const json = await text.jsonValue();
    expect(json).toEqual("Welcome to the-internet");
  });

  test("check if adding script tag works", async () => {
    const projectDir = process.env.PWD;
    await page.goto(`file:///${projectDir}/src/1.html`);
    await page.addScriptTag({
      content: 'document.getElementById("demo").innerHTML ="I Love You";',
    });
    const headline = await page.$eval("h1", (element) => element.textContent);
    expect(headline).toEqual("I Love You");
  });

  test("check if adding style works", async () => {
    const projectDir = process.env.PWD;
    await page.goto(`file:///${projectDir}/src/1.html`);
    await page.addStyleTag({
      url: `file:///${projectDir}/src/1.css`,
    });
    const styleObject = await page.evaluate(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const headline: any = document.querySelector("h1");
      return JSON.parse(JSON.stringify(getComputedStyle(headline)));
    });
    expect(styleObject.fontSize).toEqual("25px");
  });

  test("check if click work", async () => {
    await page.goto("https://the-internet.herokuapp.com", {
      waitUntil: "networkidle0",
    });
    await Promise.all([
      page.waitForNavigation(), // The promise resolves after navigation has finished
      page.click('li>a[href*="add_remove_elements"]'),
    ]);
    await page.waitForSelector("#content>h3", { visible: true });
    const header = await page.$eval("#content>h3", (el) => el.innerHTML);
    expect(header).toEqual("Add/Remove Elements");
    const addElement = await page.$('button[onclick="addElement()"]');
    addElement?.click();
    await page.waitForSelector('button[onclick="deleteElement()"]', {
      visible: true,
    });
    const count = await page.$$eval(
      'button[onclick="deleteElement()"]',
      (elements) => elements.length
    );
    expect(count).toEqual(1);
  });

  test("verify if page content can be fetched", async () => {
    const projectDir = process.env.PWD;
    await page.goto(`file:///${projectDir}/src/1.html`);
    const pageContent = await page.content();
    expect(pageContent).toContain("<p>My first paragraph.</p>");
  });

  test("verify emulate the page to iphone 6", async () => {
    const iPhone = puppeteer.devices["iPhone 6"];
    await page.emulate(iPhone);
    await page.goto("https://www.adac.de/", { waitUntil: "networkidle0" });
    await page.tap("nav+div>span");
    await page.waitForSelector("div[role=button]>span", { visible: true });
  });

  test("verify wait untill page url is correct", async () => {
    await page.goto("https://the-internet.herokuapp.com", {
      waitUntil: "networkidle0",
    });
    const ab = await page.$("li>a");
    await ab?.click();
    await page.waitForFunction(
      'window.location.href=="https://the-internet.herokuapp.com/abtest"'
    );
  });

  test("verify wait for navigation and wait for", async () => {
    await page.goto("https://the-internet.herokuapp.com", {
      waitUntil: "networkidle0",
    });
    const ab = await page.$("li>a");
    await ab?.click();
    await page.waitForNavigation({ timeout: 5000, waitUntil: "networkidle0" });
    const currentURL = await page.url();
    expect(currentURL).toEqual("https://the-internet.herokuapp.com/abtest");
    await page.goBack();
    await Promise.all([page.waitForNavigation(), page.click("li>a")]);
    const selector = "div.example";
    await page.waitForFunction(
      (selector) => document.querySelector(selector),
      {},
      selector
    );
  });
});
