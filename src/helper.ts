import puppeteer, { ElementHandle } from "puppeteer";
export let ENV_URL = "https://the-internet.herokuapp.com/";

export async function openBrowser(): Promise<puppeteer.Browser> {
  return puppeteer.launch({
    defaultViewport: {
      width: 1920,
      height: 1080,
    },
    headless: true,
    args: [
      "--disable-dev-shm-usage",
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-gpu",
      "--disable-translate",
      "--disable-extensions",
    ],
  });
}

export async function openPage(
  browser: puppeteer.Browser,
  pageName: string
): Promise<puppeteer.Page> {
  const page = (await browser.pages())[0];
  await page.setCacheEnabled(false);
  page.setDefaultTimeout(20000);
  await page.goto(ENV_URL, {
    waitUntil: "networkidle2",
  });
  return page;
}

export async function textBySelector(
  page: puppeteer.Page,
  selector: string
): Promise<string> {
  const element = await page.$(selector);
  if (!element) {
    throw new Error(`No element at '${selector}' found`);
  }
  const text = await (await element.getProperty("textContent")).jsonValue();
  return String(text);
}

export async function selectorByXPath(
  page: puppeteer.Page,
  selector: string
): Promise<object> {
  const element = await page.waitForXPath(selector);
  if (!element) {
    throw new Error(`No element at '${selector}' found`);
  }
  return element;
}

export async function getAttributeValueBySelector(
  page: puppeteer.Page,
  selector: string,
  attribute: string
): Promise<string> {
  const element = await page.$(selector);

  if (!element) {
    throw new Error(`No element at '${selector}' found`);
  }
  const attributeValue = await element.getProperty(`${attribute}`);
  if (!attributeValue) {
    throw new Error(`attribute does not exist for element '${selector}'`);
  }
  return String(await attributeValue.jsonValue());
}

export async function getAllElementsBySelector(
  page: puppeteer.Page,
  selector: string
): Promise<Array<ElementHandle>> {
  const elements = await page.$$(selector);
  if (!elements) {
    throw new Error(`No element at '${selector}' found`);
  }
  return elements;
}