import { Message } from 'discord.js';
import { log } from '../../utils/common';

module.exports = [
	{
		name: 'onTwitterLinkPosted',
		execute: async (msg: Message): Promise<void> => {
			const s = msg.content.split(/\/s|,+/g);
			log(s);
		},
	},
	{
		name: 'onTwitterLinkUpdated',
		execute: async (msg: Message): Promise<void> => {
			// TODO document why this async method 'execute' is empty
		},
	},
];
