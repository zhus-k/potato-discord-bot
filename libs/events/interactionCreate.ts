import { CommandInteraction } from 'discord.js';
import { client, commandList } from '../../bot';
import { log, error } from '../utils/common';

module.exports = [
	{
		name: 'interactionCreate',
		execute: async (i: CommandInteraction): Promise<void> => {
			if (i.user.bot) return;
			// log('interaction: ', i);
			const { commandName } = i;

			if (i.isCommand()) {
				try {
					await commandList.get(commandName)?.(i);
				}
				catch (err) {
					error(err);
					return i.reply({
						content: 'There was an error while executing this command!',
						ephemeral: true,
					});
				}
			}
			if (i.isSelectMenu()) {
				try {
					await commandList.get(commandName)?.(i);
				}
				catch (err) {
					error(err);
					return i.reply({
						content:
							'There was an error while executing this menu interaction!',
						ephemeral: true,
					});
				}
			}
			if (i.isButton()) {
				try {
					await commandList.get(commandName)?.(i);
				}
				catch (err) {
					error(err);
					return i.reply({
						content:
							'There was an error while executing this menu interaction!',
						ephemeral: true,
					});
				}
			}
		},
	},
];
