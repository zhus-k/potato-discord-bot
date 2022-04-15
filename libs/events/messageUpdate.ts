import { Message } from 'discord.js';
import { client } from '../../bot';
import { log } from '../utils/common';

module.exports = [
	{
		name: 'messageUpdate',
		execute: async (oldMsg: Message, newMsg: Message): Promise<void> => {
			if (oldMsg.author.bot || newMsg.author.bot || newMsg == oldMsg) return;
			log('[messageUpdate]', oldMsg, newMsg);

			if (/twitter.com\/.*\/status\/\d*/.test(newMsg.content.trim())) {
				client.emit('onTwitterLinkUpdated', newMsg);
			}
			if (/pixiv.net\/en\/artworks\/\d*/.test(newMsg.content.trim())) {
				client.emit('onPixivLinkUpdated', newMsg);
			}
			if (/yande.re\/(post|pool)/.test(newMsg.content.trim())) {
				client.emit('onYandeLinkUpdated', newMsg);
			}
		},
	},
];
