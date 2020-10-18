import puppeteer from "puppeteer";
import { textBySelector } from "./helper";
let browser: puppeteer.Browser;
beforeEach(async () => {
  browser = await puppeteer.launch({ headless: true });
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
    await allPages[1].screenshot({ path: "test.jpg" });
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
      expect(dialog.type()).toEqual("alert");
      expect(dialog.message()).toEqual("I am a JS Alert");
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
      await dialog.accept("Hello").then(() => (dialogPromptFlag = true));
      expect(dialog.type()).toEqual("prompt");
      expect(dialog.message()).toEqual("I am a JS prompt");
    });
    await page.goto("https://the-internet.herokuapp.com/javascript_alerts");
    await page.click("button[onclick='jsPrompt()']");
    expect(dialogPromptFlag).toBeTruthy();
    expect(await textBySelector(page, "#result")).toContain("Hello");
  });
});

describe("All event based scenarios", () => {
  test("Verify the close event", async () => {
    const page = (await browser.pages())[0];
    let pageIsClosed = false;
    page.on("close", () => {
      pageIsClosed = true;
    });
    await page.close();
    expect(pageIsClosed).toBeTruthy();
  });

  test("Verify the console event", async () => {
    let consoleflag = false;
    const page = (await browser.pages())[0];
    page.on("console", (msg) => {
      consoleflag = true;
      for (let i = 0; i < msg.args().length; ++i)
        console.log(`${i}: ${msg.args()[i]}`);
    });
    await page.goto("https://the-internet.herokuapp.com/");
    //This is to check that you can trigger console message using puppeteer
    await page.evaluate(() => console.log(5 + 3));
    //This is to find element in DOM
    await page.evaluate(() => console.log(document.querySelector("h1")));
    expect(consoleflag).toBeTruthy();
  });

  test("Verify the domcontent is loaded", async () => {
    const page = (await browser.pages())[0];
    let domISLoaded = false;
    page.on("domcontentloaded", () => {
      domISLoaded = true;
    });
    await page.goto("https://the-internet.herokuapp.com/", {
      waitUntil: "domcontentloaded",
    });
    expect(domISLoaded).toBeTruthy();
  });

  test("Verify tracking page error event", async () => {
    const page = (await browser.pages())[0];
    page.once("pageerror", (result) => {
      expect(result.name).toEqual("Error");
      expect(result.message).toContain(
        "TypeError: Cannot read property 'xyz' of undefined"
      );
    });
    await page.goto("https://the-internet.herokuapp.com/javascript_error", {
      waitUntil: "networkidle0",
    });
  });

  test("Verify tracking requests and responses", async () => {
    const page = (await browser.pages())[0];
    page.once("request", (request) => {
      console.log(request);
    });

    page.once("response", (response) => {
      console.log(response);
    });
    await page.goto("https://the-internet.herokuapp.com/status_codes/200", {
      waitUntil: "networkidle0",
    });
  });

  test("Verify tracking finished request", async () => {
    const page = (await browser.pages())[0];
    page.once("requestfinished", (request) => {
      console.log("request finished");
      console.log(request);
    });
    await page.goto("https://the-internet.herokuapp.com/asdf.jpg", {
      waitUntil: "networkidle0",
    });
  });

  test("Verify tracking if frameattached request", async () => {
    const page = (await browser.pages())[0];
    page.on("frameattached", (result) => {
      console.log("frame is attached");
      console.log(result.parentFrame());
      console.log(result.childFrames());
    });
    await page.goto("https://the-internet.herokuapp.com/iframe", {
      waitUntil: "networkidle0",
    });
  });
  // metrics, error, requestfailed, workercreated, workerdestroyed events are not covered
});
