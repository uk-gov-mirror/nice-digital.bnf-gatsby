import os from "os";

const isInDocker = !!process.env.IN_DOCKER,
	isTeamCity = !!process.env.TEAMCITY_VERSION,
	cpuCount = os.cpus().length,
	totalMemGB = os.totalmem() / 1024 ** 3;

export const config: WebdriverIO.Config = {
	// Use devtools to control Chrome when we're running tests locally
	// Avoids issues with having the wrong ChromeDriver installed via selenium-standalone when Chrome updates every 6 weeks.
	// We need to use webdriver protocol in Docker because we use the selenium grid.
	automationProtocol: isInDocker ? "webdriver" : "devtools",

	maxInstances: isInDocker ? 2 : 1,
	path: "/wd/hub",
	port: 4444,

	specs: ["./features/**/*.feature"],

	exclude: ["./features/**/header.feature", "./features/**/searchPage.feature"],

	capabilities: [
		{
			browserName: "chrome",
			// Don't block navigation on full page load (fonts, GTM, cookie-banner
			// CDN etc). DOMContentLoaded is enough: every page-open step then
			// waits for React explicitly, so a slow third-party resource can't
			// stall `browser.url()` past the cucumber step timeout.
			pageLoadStrategy: "eager",
			"goog:chromeOptions": {
				args: [
					"--window-size=1920,1080",
					// Automation optimizations as per https://github.com/GoogleChrome/chrome-launcher/blob/master/docs/chrome-flags-for-tools.md
					"--disable-dev-shm-usage",
					"--enable-automation",
					"--disable-extensions",
					"--disable-component-extensions-with-background-pages",
					"--disable-background-networking",
					"--disable-sync",
				].concat(isInDocker ? "--headless" : []),
			},
		},
	],

	// bail: 1,
	logLevel: "error",

	// Run against the production build of the Gatsby site by default as dev mode renders on demand so causes timing issues
	baseUrl: "http://localhost:9000/",
	reporters: [
		"spec",
		isTeamCity && "teamcity",
		isInDocker && [
			"allure",
			{
				useCucumberStepReporter: true,
				// Turn on screenshot reporting for error shots
				disableWebdriverScreenshotsReporting: false,
			},
		],
	].filter(Boolean) as WebdriverIO.Config["reporters"],

	framework: "cucumber",
	cucumberOpts: {
		require: [
			"./steps/**/*.ts",
			"./node_modules/@nice-digital/wdio-cucumber-steps/lib/index.js",
		],
		tags: "not @pending", // See https://docs.cucumber.io/tag-expressions/
		// Need quite a long timeout here because some of the Axe a11y tests take a while for longer pages (like drugs A to Z)
		timeout: 60000,
		// Retry a failed scenario once on CI: one-off browser/page-load stalls
		// (single scenario out of ~1700 tests) shouldn't fail a 30-minute build.
		// Genuine failures still fail - they reproduce on the retry.
		retry: isInDocker ? 1 : 0,
	},

	onPrepare: function () {
		console.log(
			`[wdio.conf] Running in ${isInDocker ? "Docker" : "local"}${
				isTeamCity ? " (TeamCity)" : ""
			} → CPUs: ${cpuCount} | Memory: ${totalMemGB.toFixed(1)} GB`
		);
	},

	// Start every scenario with a clean cookie state. Cleaning up at the END of
	// a scenario (as the cookie/EULA feature used to) silently skips when a
	// scenario fails, leaving cookies behind that stop the banner appearing for
	// the next scenario - the source of 60s step timeouts.
	beforeScenario: async function () {
		try {
			await browser.deleteCookies();
		} catch {
			// No page loaded yet in this session - nothing to delete
		}
	},

	afterStep: async function (_test, _scenario, { error }) {
		// Take screenshots on error, these end up in the Allure reports
		if (error) await browser.takeScreenshot();
	},

	afterScenario: async function (_world, _result, _context) {
		// Clear session storage after each test because Gatsby stores scroll
		// positions of each page, which causes issues running multiple tests
		// on the same page in the same browser instance when scrolling to links
		await browser.execute("window.sessionStorage.clear()");
	},

	autoCompileOpts: {
		autoCompile: true,
		// see https://github.com/TypeStrong/ts-node#cli-and-programmatic-options
		// for all available options
		tsNodeOpts: {
			transpileOnly: true,
			project: "tsconfig.json",
		},
	},
};
