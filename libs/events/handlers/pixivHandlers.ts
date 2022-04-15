import {
	Message,
	MessageAttachment,
	MessageEmbed,
} from 'discord.js';
import { pixiv } from '../../../bot';
import { PixivPost } from '../../modules/pixiv/pixiv';

module.exports = [
	{
		name: 'onPixivLinkPosted',
		execute: async (msg: Message): Promise<void> => {
			(await pixiv).onPixivLink(msg);
		},
	},
	{
		name: 'onPixivLinkUpdated',
		execute: async (msg: Message): Promise<void> => {
			// TODO document why this async method 'execute' is empty
		},
	},
	{
		name: 'createZipFollowUp',
		execute: async (
			msg: Message,
			ctx: {
				url: string, info: PixivPost, ogImgUrl: string
			})
			: Promise<void> => {
			(await pixiv).onZipRequest(msg, ctx);
		},
	},
];
