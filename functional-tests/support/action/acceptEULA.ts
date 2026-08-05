/**
 * Best effort dismissal of the EULA banner, which blocks clicks while it's up.
 *
 * The banner only renders once cookie consent has been given, and only until
 * it's accepted - so most page opens in a session have nothing to dismiss.
 * Return immediately in that case: the scenarios that actually test the banner
 * use the "I accept EULA banner terms" step, which waits for it properly.
 */
export async function acceptEULA(): Promise<void> {
	const EULAAcceptButton = await $("#btn-accept-bnf-eula");

	if (!(await EULAAcceptButton.isDisplayed())) return;

	await EULAAcceptButton.scrollIntoView();
	await EULAAcceptButton.click();
}
export default acceptEULA;
