import { Message } from 'discord.js';
import { log } from '../utils/common';

module.exports = [
	{
		name: 'messageDeleteBulk',
		execute: async (msg: Message[]): Promise<void> => {
			log('bulk delete: ');
			msg.forEach((m) => log(`${m.channelId}::${m.id}: '${m.content}'`));
		},
	},
];
