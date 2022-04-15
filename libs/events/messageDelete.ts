import { Message } from 'discord.js';
import { log } from '../utils/common';

module.exports = [
	{
		name: 'messageDelete',
		execute: async (msg: Message): Promise<void> => {
			log(`deleted ${msg.channelId}::${msg.id}: '${msg.content}'`);
		},
	},
];
