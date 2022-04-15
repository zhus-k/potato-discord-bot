import { ModulePage } from '../interfaces';

import { Page } from 'puppeteer';

export default class Twitter implements ModulePage {
	page: Page;

	constructor(page: Page) {
		this.page = page;
	}
}
