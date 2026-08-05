/**
 * Dismiss the NICE cookie banner, which blocks clicks while it's up.
 *
 * Deliberately does not wait for "body #ccc" to exist, unlike the upstream
 * helper in @nice-digital/wdio-cucumber-steps: Civic loads the banner from a
 * CDN and verifies a licence key over the network, so a third party blip means
 * the element never appears at all. Nothing is blocking clicks in that case,
 * so there's nothing to fail about.
 */
export async function acceptCookieBanner(): Promise<void> {
	const cookieControlElement = await $("body #ccc");

	if (!(await cookieControlElement.isExisting())) return;

	const acceptButton = await cookieControlElement.$("button.ccc-accept-button");

	if (await acceptButton.isDisplayed()) await acceptButton.click();
}
