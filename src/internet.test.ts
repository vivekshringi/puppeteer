import puppeteer from "puppeteer";
let browser: puppeteer.Browser;
let page: puppeteer.Page;
const targetURL = "https://the-internet.herokuapp.com/";

const e = {
  header: "div>h3",
  addButton: 'button[onclick*="addElement()"]',
  deleteButton: 'button[onclick*="deleteElement()"]',
  elementSelenium: 'div>a[href*="ele"]',
  forkElement: 'a[href*="github"]',
};
const d = {
  expHeader: "Add/Remove Elements",
  expLinkedURL: "http://elementalselenium.com/",
};

afterAll(async () => {
  await page.close();
  await browser.close();
});

describe("The Internet Scenarios", () => {
  describe("The Add/Remove element scenarios", () => {
    beforeAll(async () => {
      browser = await puppeteer.launch({
        headless: true
      });
      [page] = await browser.pages();
      await page.goto(`${targetURL}add_remove_elements/`, {
        waitUntil: "networkidle0",
      });
    });
    test("Verify opening add/remove elements", async () => {
      expect(await page.url()).toContain("add_remove_elements/");
      await page.$(e.header).then(async (el) => {
        expect(
          await await (await el?.getProperty("textContent"))?.jsonValue()
        ).toEqual(d.expHeader);
      });
      expect(await page.$eval(e.header, (el) => el.textContent)).toEqual(
        d.expHeader
      );
    });

    test("Verify adding/deleting elements in add/remove elements page", async () => {
      await page.click(e.addButton);
      await page.waitForSelector(e.deleteButton, {
        visible: true,
      });
      await page.click(e.deleteButton);
      await page.waitForFunction(
        (selector) => !document.querySelector(selector),
        {},
        e.deleteButton
      );
    });

    test("Verify adding/deleting elements mutliple times", async () => {
      const times = 10;
      await (async (length = times) => {
        for (let count = 1; count <= length; count++) {
          await page.click(e.addButton);
          const deleteButtons = await page.$$(e.deleteButton);
          expect(deleteButtons).toHaveLength(count);
        }
      })();

      await (async (length = times) => {
        for (let count = 1; count <= length; count++) {
          await page.click(e.deleteButton);
          const deleteButtons = await page.$$(e.deleteButton);
          expect(deleteButtons).toHaveLength(length - count);
        }
      })();
    });

    test("Verify element size and dimensions", async () => {
      const elemetSize = await (await page.$(e.addButton))?.boundingBox();
      expect(elemetSize?.height).toEqual(45);
      expect(elemetSize?.width).toEqual(147.453125);
      expect(elemetSize?.y).toEqual(103.890625);
      expect(elemetSize?.x).toEqual(15);
    });

    test("Verify request and response on add/remove elements page", async () => {
      page.once("request", (request) => {
        expect(request.url()).toEqual(`${targetURL}add_remove_elements/`);
      });

      page.once("response", (response) => {
        expect(response.status()).toEqual(200);
      });
      await page.goto(`${targetURL}add_remove_elements/`, {
        waitUntil: "networkidle0",
      });
    });

    test("Verify github link is correct", async () => {
      await page
        .waitForSelector(e.forkElement, { visible: true })
        .then(async (el) =>
          expect(await (await el.getProperty("href")).jsonValue()).toEqual(
            "https://github.com/tourdedave/the-internet"
          )
        );
    });

    test("Verify if link is opened in new tab", async () => {
      await page
        .waitForSelector(e.elementSelenium, { visible: true })
        .then((el) => el.click());
      for (let count = 1; count <= 5; count++) {
        const pages = await browser.pages();
        if (pages.length == 2) {
          expect(pages[1].url()).toEqual(d.expLinkedURL);
          break;
        }
        await page.waitFor(300);
        console.log(`waiting for ${count} times`);
      }
    });
  });
});
