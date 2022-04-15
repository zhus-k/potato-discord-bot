/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-inline-comments */
import { clientId, guildId, token } from './config.json';
import { CommandInteraction } from 'discord.js';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { SlashCommandBuilder } from '@discordjs/builders';
import { Command } from './libs/interfaces';
import { log, error, recursivelyFindFiles } from './libs/utils/common';

const commandList = new Map<string, (i: CommandInteraction) => any>();

const globals: SlashCommandBuilder[] = []; // Global Commands
const commands: SlashCommandBuilder[] = []; // Guild Commands

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
