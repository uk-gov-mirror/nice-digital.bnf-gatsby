async function toggleCookieCategory(nthChild: number): Promise<void> {
	// Wait for the cookie banner's options panel to actually be there before
	// interacting: if a previous scenario left the CookieControl cookie behind
	// the banner never opens, and without this guard the click hangs until the
	// cucumber step timeout (60s) with no useful error.
	const panel = await $("#ccc-optional-categories");
	await panel.waitForDisplayed({
		timeout: 15000,
		timeoutMsg:
			"Cookie banner options panel (#ccc-optional-categories) not shown - is the CookieControl cookie already set?",
	});

	const label = await panel.$(`div:nth-child(${nthChild}) > div > label`);
	await label.scrollIntoView();
	await label.waitForClickable({ timeout: 15000 });
	await label.click();
}

export async function cookiesToggle(type: "on" | "off"): Promise<void> {
	await toggleCookieCategory(1);
}

export async function WebsiteUsagecookiesToggle(
	type: "on" | "off"
): Promise<void> {
	await toggleCookieCategory(2);
}

export async function marketingCookiesToggle(
	type: "on" | "off"
): Promise<void> {
	await toggleCookieCategory(3);
}

export default cookiesToggle;
