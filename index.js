import { chromium } from "playwright";
import { loadEnvFile } from "node:process";
import { question } from "readline-sync";
import fs from "fs";

loadEnvFile(".env");

const supportURL = "https://juskys.zendesk.com/agent";
const gotoAIAgentsURL =
    "https://juskys.zendesk.com/admin/channels/ai-agents-automation/ai-agents?ref=product_tray";

const selector = '[data-tour-id="conversation__conversation-counter"]';
const testURL =
    "https://dashboard.ultimate.ai/bot/67c0523a0f50d83d930bcf19/conversations?endDate=2026-01-08+23%3A59&startDate=2026-01-08+00%3A00";

async function savePage(page, filename) {
    const pageHTML = await page.content();
    fs.writeFileSync(`html_pages/${filename}`, pageHTML);
}

(async () => {
    // 1. Launch the browser
    // 'headless: true' runs it without a visible UI (faster for scraping)
    const browser = await chromium.launch({ headless: true });

    // 2. Open a new page (tab)
    const page = await browser.newPage();

    // 3. Navigate to the URL
    await page.goto(supportURL);

    // Wait for all redirects to complete
    await page.waitForTimeout(1000);
    await page.waitForLoadState("domcontentloaded");

    await page.screenshot({ path: "login.png", fullPage: true });

    // Read credentials from environment variables
    const email = process.env.EMAIL;
    const password = process.env.PASSWORD;

    console.log(`Using email: ${email}`);

    // Fill in the login form
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);

    // Submit the login form (click the submit button)
    await page.click('button[type="submit"]');

    // Wait for navigation after login
    await page.waitForLoadState("load");

    await savePage(page, "after_login.png");

    const twoFactorCode = question("2FA Code: ");
    await page.fill("input", twoFactorCode);
    await page.screenshot({
        path: "screenshots/2fa_entered.png",
        fullPage: true,
    });

    await page.getByRole("button", { name: "Verify" }).click();
    await page.waitForTimeout(1000);

    // Wait for navigation after login
    await page.waitForLoadState("load");
    await page.waitForTimeout(500);

    await savePage(page, "after_2fa.png");
    await page.screenshot({
        path: "screenshots/after_2fa.png",
        fullPage: true,
    });

    // 4. Navigate to the AI Agents page
    await page.goto(gotoAIAgentsURL);
    await page.waitForTimeout(500);

    // Wait for the page to load
    await page.waitForLoadState("load");
    await page.waitForTimeout(500);

    await savePage(page, "ai_agents_page.png");
    await page.screenshot({
        path: "screenshots/ai_agents_page.png",
        fullPage: true,
    });

    // 4. Navigate to the Conversation Logs page
    await page.goto(testURL);
    await page.waitForTimeout(500);

    // Wait for the page to load
    await page.waitForLoadState("load");
    await page.waitForTimeout(500);

    await savePage(page, "conversation_logs_page.png");
    await page.screenshot({
        path: "screenshots/conversation_logs_page.png",
        fullPage: true,
    });

    const counterEl = page.locator(selector, { timeout: 30000 });
    const counterText = await counterEl.textContent();
    console.log(`Conversation counter text: ${counterText}`);

    // 5. Close the browser
    await browser.close();
})();
