import fs from 'fs';
import { Page, Protocol } from 'puppeteer';
import { log, error } from './common';

/**
 * Gets cookies from full Path Of Cookie
 * @returns cookies
 */
export const getCookies = async (fullPath: string): Promise<string | null> => {
	let cookie;
	try {
		log('[getCookies]: Getting cookies from: ', fullPath);
		const cookies = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
		log('[getCookies]: Cookies found: ', cookies);
		cookie = cookies;
		return cookie;
	}
	catch (err) {
		error('[getCookies]: Cookies not found: ' + err);
		return null;
	}
};

/**
 * Set cookies to Page
 * @param cookies
 */
export const setCookies = async (page: Page, cookies: Protocol.Network.CookieParam[]): Promise<void> => {
	if (!cookies) return log('[setCookies]: Cookies not found');
	if (cookies.length < 1) return log('[setCookies]: Empty cookies');
	try {
		for (const i in cookies) {
			await page.setCookie(cookies[i]);
		}
		log('[setCookies]: Cookies set');
	}
	catch (err) {
		error('[setCookies]: Error setting cookie: ', err);
	}
};

/**
 * Write cookies to full file path
 * @param cookies
 */
export const writeCookies = async (
	cookies: Protocol.Network.CookieParam[],
	fullPath: string,
): Promise<void> => {
	try {
		log('[writeCookies]: Writing cookie: ', cookies, fullPath);
		fs.writeFile(fullPath, JSON.stringify(cookies, null, 2), () => {
			fs.readFile(fullPath, () => {
				log('[writeCookies]: Written cookie');
			});
		});
	}
	catch (err) {
		error('[writeCookies]: Error writing cookie: ', err);
	}
};
