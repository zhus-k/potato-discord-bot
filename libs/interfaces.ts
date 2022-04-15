/* eslint-disable @typescript-eslint/no-explicit-any */
import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { Page } from 'puppeteer';

export interface Event {
	name: string;
	once?: boolean;
	execute: (...args: any[]) => any;
}

export interface Command {
	data: SlashCommandBuilder;
	global: boolean;
	enabled: boolean;
	type: 'interaction' | 'selectmenu' | 'button';
	execute: (i: CommandInteraction) => any;
}

export interface ModulePage {
	page: Page;
	login?: (username: string, password: string) => Promise<any>;
}
