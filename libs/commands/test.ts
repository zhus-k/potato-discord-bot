import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';

module.exports = [
	{
		data: new SlashCommandBuilder().setName('test').setDescription('test'),
		global: false,
		enabled: true,
		async execute(i: CommandInteraction): Promise<void> {
			await i.reply('TEST!');
		},
	},
];
