/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-var-requires */
import path from 'path';
require('dotenv').config();

import { Client, CommandInteraction, Intents } from 'discord.js';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';
import { clientId, guildId, token } from './config.json';
import {
	clearTemp,
	error,
	log,
	recursivelyFindFiles,
} from './libs/utils/common';

import { Command, Event } from './libs/interfaces';
import { SlashCommandBuilder } from '@discordjs/builders';

export const root = path.resolve();
export const temp = path.join(root, 'temp');

(async () => clearTemp())();

/**
 * Discord Client
 */
export const client = new Client({
	intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});
export const commandList = new Map<string, (i: CommandInteraction) => any>();

client.once('ready', async () => {
	initCommands();
	initEvents();
});

/**
 * Register Command Files
 */
const initCommands = async (): Promise<void> => {
	// Global Commands
	const globals: SlashCommandBuilder[] = [];
	// Guild Commands
	const commands: SlashCommandBuilder[] = [];

	const commandFilesPaths = recursivelyFindFiles('./libs/commands', []);
	for (const filePath of commandFilesPaths) {
		const commandsFile: Command[] = require(`./${filePath}`);
		for (const command of commandsFile) {
			log(command);
			commandList.set(command.data.name, command.execute);

			command.global ? globals.push(command.data) : commands.push(command.data);
		}
	}

	log('Command Library: ', commandList);

	/**
	 * Registering Commands
	 */
	const rest = new REST({ version: '9' }).setToken(token);

	(async () => {
		await rest
			.put(Routes.applicationGuildCommands(clientId, guildId), {
				body: commands,
			})
			.then(() => log('Successfully registered application commands.'))
			.catch(error);

		await rest
			.put(Routes.applicationCommands(clientId), {
				body: globals,
			})
			.then(() => log('Successfully registered global application commands.'))
			.catch(error);
	})();
};

/**
 * Add Event Listeners
 */
const initEvents = async (): Promise<void> => {
	const eventFilesPaths = recursivelyFindFiles('./libs/events', []);

	for (const filePath of eventFilesPaths) {
		const eventsFile: Event[] = require(`./${filePath}`);
		for (const event of eventsFile) {
			if (event.once) {
				client.once(event.name, (...args) => event.execute(...args));
			}
			else {
				client.on(event.name, (...args) => event.execute(...args));
			}
			log('[Add Event Listener]', event.name);
		}
	}
};

client.login(token);

/**
 * Puppeteer
 */

import puppeteer from 'puppeteer';
export const browser = (async () =>
	puppeteer.launch({
		headless: false,
		defaultViewport: { width: 1920, height: 1080 },
	}))();

import Pixiv from './libs/modules/pixiv/pixiv';
export const pixiv = browser.then(async (_browser) => {
	return (async (): Promise<Pixiv> => {
		const _page = await _browser.newPage();
		return new Pixiv(_page);
	})();
});

// import Twitter from "./src/plugins/twitter";
// const tuid = process.env.TWITTER_UID as string;
// const tpwd = process.env.TWITTER_PWD as string;
// export const twitter = await (async (): Promise<Twitter> => {
//   const _page = await browser.newPage();
//   return new Twitter(_page, __dirname);
// })().then((t) => {
//   t.login(tuid, tpwd);
//   return t;
// });
