import {
	type PreRenderHTMLArgs,
	type WrapPageElementBrowserArgs,
} from "gatsby";
import React, { type ReactElement } from "react";

import { Layout } from "@/components/Layout/Layout";

export const onPreRenderHTML = ({
	getHeadComponents,
	replaceHeadComponents,
}: PreRenderHTMLArgs): void => {
	const components = getHeadComponents();

	components.push(
		<script
			src={`${process.env.GATSBY_COOKIE_BANNER_URL}?v=24062024`}
			type="text/javascript"
			key="cookie-banner"
			async
		></script>
	);

	// Fonts are self-hosted via @fontsource imports in the Layout component, so
	// no external stylesheet is needed here (a synchronous fonts.googleapis.com
	// link blocks DOMContentLoaded when the fetch is slow).

	replaceHeadComponents(components);
};

export const wrapPageElement = ({
	element,
	props,
}: WrapPageElementBrowserArgs): ReactElement => (
	<Layout {...props}>{element}</Layout>
);
