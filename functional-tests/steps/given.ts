import { Given } from "@wdio/cucumber-framework";

import { openWebsite } from "@nice-digital/wdio-cucumber-steps/lib/support/action/openWebsite.js";
import { setWindowSize } from "@nice-digital/wdio-cucumber-steps/lib/support/action/setWindowSize.js";

// Deliberately the local copy, not the wdio-cucumber-steps one: wdio-cucumber-steps waits for
// "body #ccc" to exist and throws after 2s, which turns a slow or failed
// Civic cookie-banner load into a failed test rather than a no-op
import { acceptCookieBanner } from "../support/action/acceptCookieBanner.js";
import { acceptEULA } from "../support/action/acceptEULA.js";
import { waitForReact } from "../support/action/waitForReact.js";
import { getPath, PageName } from "../support/pagePaths.js";

Given(/^I open the (.*) page$/, async (pageName: PageName) => {
	await openWebsite("url", getPath(pageName));

	await waitForReact();

	// Make sure the cookie banner is dismissed before we continue, as it's an overlay so blocks clicks
	await acceptCookieBanner();

	// Dismiss the EULA, which will also block clicks
	await acceptEULA();
});

Given(/^I am using a desktop size browser$/, () =>
	setWindowSize("1920", "1080")
);

Given(/^I am using a mobile size browser$/, () => setWindowSize("320", "568"));
