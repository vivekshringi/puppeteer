import puppeteer, { ElementHandle } from "puppeteer";
export const ENV_URL = "https://the-internet.herokuapp.com/";

export async function openBrowser(): Promise<puppeteer.Browser> {
  return puppeteer.launch({
    defaultViewport: {
      width: 1920,
      height: 1080,
    },
    headless: false,
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
  browser: puppeteer.Browser
): Promise<puppeteer.Page> {
  const [page] = await browser.pages();
  await page.setCacheEnabled(false);
  page.setDefaultTimeout(10000);
  await page.goto(ENV_URL, {
    waitUntil: "networkidle0",
  });
  return page;
}

export async function textBySelector(
  page: puppeteer.Page,
  selector: string
): Promise<string> {
  await page.waitForSelector(selector);
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
): Promise<puppeteer.ElementHandle<Element>[]> {
  await page.waitForXPath(selector);
  const element = await page.$x(selector);
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
