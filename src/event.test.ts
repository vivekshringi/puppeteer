import puppeteer, { Browser } from "puppeteer";
import { textBySelector } from "./helper";
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

describe("Scenarios to test events", () => {
  test("Verify opening multiple tabs", async () => {
    let page = (await browser.pages())[0];
    await page.goto("http://example.com");
    page = await browser.newPage();
    await page.goto("https://the-internet.herokuapp.com/");
    const allPages = await browser.pages();
    expect(allPages.length).toEqual(2);
  });

  test("Verify load event is triggered on loading", async () => {
    let pageLoadedFlag = false;
    const page = (await browser.pages())[0];
    page.once("load", () => {
      pageLoadedFlag = true;
    });
    await page.goto("http://example.com");
    expect(pageLoadedFlag).toBeTruthy();
  });

  test("Verify dialog event is triggered on js alert", async () => {
    let dialogFlag = false;
    const page = (await browser.pages())[0];
    page.on("dialog", (dialog) => {
      dialogFlag = true;
      dialog.accept();
      expect(dialog.type()).toEqual('alert');
      expect(dialog.message()).toEqual('I am a JS Alert');
    });
    await page.goto("https://the-internet.herokuapp.com/javascript_alerts");
    await page.click("button[onclick='jsAlert()']");
    expect(dialogFlag).toBeTruthy();
  });

  test("Verify confirming the js confirm ", async () => {
    let dialogFlag = false;
    const page = (await browser.pages())[0];
    page.on("dialog", async (dialog) => {
      await dialog.accept().then(() => (dialogFlag = true));
    });
    await page.goto("https://the-internet.herokuapp.com/javascript_alerts");
    await page.click("button[onclick='jsConfirm()']");
    expect(dialogFlag).toBeTruthy();
  });

  test("Verify cancel the js confirm message ", async () => {
    let dialogCancelFlag = false;
    const page = (await browser.pages())[0];
    page.on("dialog", async (dialog) => {
      await dialog.dismiss().then(() => (dialogCancelFlag = true));
      expect(dialog.type()).toEqual("confirm");
      expect(dialog.message()).toEqual("I am a JS Confirm");
    });
    await page.goto("https://the-internet.herokuapp.com/javascript_alerts");
    await page.click("button[onclick='jsConfirm()']");
    expect(dialogCancelFlag).toBeTruthy();
  });

  test("Verify confirming the js prompt message ", async () => {
    let dialogPromptFlag = false;
    const page = (await browser.pages())[0];
    page.on("dialog", async (dialog) => {
      await dialog.accept('Hello').then(()=>(dialogPromptFlag=true));
      expect(dialog.type()).toEqual("prompt");
      expect(dialog.message()).toEqual("I am a JS prompt");
    });
    await page.goto("https://the-internet.herokuapp.com/javascript_alerts");
    await page.click("button[onclick='jsPrompt()']");
    expect(dialogPromptFlag).toBeTruthy();
    expect(await textBySelector(page,'#result')).toContain('Hello');
  });

  test("Verify confirming the js prompt message ", async () => {
    let dialogPromptFlag = false;
    const page = (await browser.pages())[0];
    page.on("request", (result)=>console.info('request is made '+ result.url()));
    page.on('requestfailed', (result)=>console.info('request is failed'+ result.url()));
    page.on('requestfinished' ,(result)=>console.info('request is finished'+ result));
    page.on('response',(result)=>console.info('response is received'+ result.status()));
    await page.goto("https://the-internet.herokuapp.com/broken_images");
  });
});
