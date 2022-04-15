import { Message } from 'discord.js';
import { client } from '../../bot';
import { log } from '../utils/common';

module.exports = [
	{
		name: 'messageCreate',
		execute: async (msg: Message): Promise<void> => {
			if (msg.author.bot) return;
			log('[messageCreate]', msg.content);

			if (/twitter.com\/.*\/status\/\d*/.test(msg.content.trim())) {
				client.emit('onTwitterLinkPosted', msg);
			}
			if (/pixiv.net\/en\/artworks\/\d*/.test(msg.content.trim())) {
				client.emit('onPixivLinkPosted', msg);
			}
			if (/yande.re\/(post|pool)/.test(msg.content.trim())) {
				client.emit('onYandeLinkPosted', msg);
			}
		},
	},
];
