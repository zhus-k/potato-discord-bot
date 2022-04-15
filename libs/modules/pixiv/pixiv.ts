import fs from 'fs';
import {
	checkForFlag,
	createEmbeddedMessagesWithImage,
	downloadResponse,
	error,
	log,
	makeDirTo,
} from '../../utils/common';
import {
	Message,
	MessageActionRow,
	MessageAttachment,
	MessageButton,
	MessageComponentInteraction,
	MessageEmbed,
} from 'discord.js';
import { Page } from 'puppeteer';
import { ModulePage } from '../../interfaces';
import { client, pixiv, temp } from '../../../bot';
import path from 'path';
import archiver from 'archiver';

export default class Pixiv implements ModulePage {
	page: Page;
	fetchBaseUrl = 'https://www.pixiv.net/ajax/illust/';
	opts = { referer: 'https://www.pixiv.net/' };
	dir: string;

	/**
	 * Pixiv
	 * @param page puppeteer.Page
	 */
	constructor(page: Page) {
		this.page = page;
		this.dir = path.join(temp, 'pixiv');
	}

	public async onPixivLink(msg: Message): Promise<void> {
		const args = msg.content.split(/(\s+|,+)/);
		log('[args]', args);
		const url = args[0];
		const exclude = checkForFlag(args, ['-e', '-ex', '--exclude']);
		const compact = checkForFlag(args, ['-c', '--compact']);
		const expand = checkForFlag(args, ['-!c', '--!compact']);
		const zip = checkForFlag(args, ['-z', '--zip']);
		const selection = args.slice(1).filter((s) => {
			return s.match(/\d+/);
		});
		log('[final args]', url, exclude, selection, zip);
		const p = await pixiv;

		// Get Image Data
		const fetched = await p.fetchImageData(url);
		if (!fetched) return;
		const { info, rgImgUrl, ogImgUrl } = fetched;
		log('[info]', info, rgImgUrl, ogImgUrl);
		const downloaded = await this.fetchImages(info, rgImgUrl, 'master');
		const { embeds, files } = await createEmbeddedMessagesWithImage(info, downloaded.files);
		log('[created embeds]', info, embeds.length, files.length);

		// Filter process
		const { f_embeds, f_files } = await this.filterForSelection(selection, exclude, embeds, files);
		log('[final embeds]', f_embeds.length, f_files.length);
		if (f_embeds.length < 1 || f_files.length < 1) {
			msg.reply('[Pixiv] Your selection was invalid');
			return;
		}

		const btn = new MessageButton()
			.setCustomId('zipRequest')
			.setLabel('Request ZIP')
			.setStyle('PRIMARY');
		const row = new MessageActionRow()
			.addComponents([btn]);
		f_embeds[0]
			.addFields([
				{ name: 'Views', value: info.viewCount.toString(), inline: true },
				{ name: 'Likes', value: info.likeCount.toString(), inline: true },
				{ name: 'Uploaded Date', value: new Date(info.uploadDate).toISOString() },
			])
			.setURL(url)
			.setAuthor({ name: info.userName })
			.setTimestamp(new Date());

		const chunkSize = !expand && (compact || embeds.length >= 8) ? 4 : 1;
		for (let i = 0; i < f_embeds.length; i += chunkSize) {
			const _embeds_ = f_embeds.slice(i, i + chunkSize);
			const _files_ = f_files.slice(i, i + chunkSize);

			await msg.reply({
				embeds: [..._embeds_],
				files: [..._files_],
			});
		}

		f_embeds[0].setTitle(`[${info.id}] ${info.title}`);
		const _msg = await msg.reply({ embeds: [f_embeds[0]], components: [row] });

		const ctx = { url, info, ogImgUrl };
		client.emit('createZipFollowUp', _msg, ctx);
	}

	private async filterForSelection(
		selection: string[],
		exclude: boolean,
		embeds: MessageEmbed[],
		files: MessageAttachment[],
	): Promise<
		{
			f_embeds: MessageEmbed[],
			f_files: MessageAttachment[]
		}
	> {
		const f_embeds: MessageEmbed[] = [];
		const f_files: MessageAttachment[] = [];
		if (selection && selection.length > 0) {
			if (exclude) {
				for (const i in embeds) {
					const a = selection.includes((Number(i) + 1).toString());
					if (!a) {
						f_embeds.push(embeds[i]);
						f_files.push(files[i]);
					}
				}
			}
			else {
				for (const i in embeds) {
					const a = selection.includes((Number(i) + 1).toString());
					if (a) {
						f_embeds.push(embeds[i]);
						f_files.push(files[i]);
					}
				}
			}
		}
		else { return Promise.resolve({ f_embeds: [...embeds], f_files: [...files] }); }
		return Promise.resolve({ f_embeds: [...f_embeds], f_files: [...f_files] });
	}

	public async createZipAttachment(
		url: string,
		info: PixivPost,
		imgUrl: string,
	): Promise<
		{
			embeds: MessageEmbed[],
			files: MessageAttachment[],
		} | void
	> {
		log('[Zip]', 'Creating Zip');
		const downloaded = await this.fetchImages(info, imgUrl, 'original');
		const embed = new MessageEmbed()
			.setTitle(`[${info.id}] ${info.title}`)
			.addFields(
				{ name: 'Artist', value: info.userName },
				// { name: 'Views', value: info.viewCount.toString(), inline: true },
				// { name: 'Likes', value: info.likeCount.toString(), inline: true },
				// { name: 'Uploaded Date', value: new Date(info.uploadDate).toISOString() },
			)
			.setURL(url)
			.setTimestamp(new Date());

		const a = archiver('zip', { zlib: { level: 9 } });
		const outPath = path.join(temp, `Pixiv_${info.id}.zip`);
		const writeStream = fs.createWriteStream(outPath);
		await (async () => {
			// log('[Archiver]', `Writing ${downloaded.dir} to ${outPath}.zip`);
			a.directory(downloaded.dir, false)
				.on('error', (err) => error(err))
				.pipe(writeStream);

			writeStream.on('close', () => log('[WriteStream]', 'Closed'));
			await a.finalize();
		})();

		const zipped = new MessageAttachment(outPath);
		log('[Zip Out]', embed, zipped);
		return Promise.resolve({ embeds: [embed], files: [zipped] });
	}

	public async fetchImageData(url: string): Promise<
		{
			info: PixivPost;
			rgImgUrl: string;
			ogImgUrl: string;
		} | void> {
		if (!url) return;
		const id = url.split('/').pop();
		if (!id) return;

		const fetchBaseUrl = this.fetchBaseUrl;
		const opts = this.opts;
		const fetchUrl = fetchBaseUrl + id;
		log('[Url]', fetchUrl);
		const {
			info,
			rgImgUrl: rgImgUrl,
			ogImgUrl: ogImgUrl,
		} = await this.page.goto(fetchBaseUrl + id, opts)
			.then(
				async (_res): Promise<
					{
						info: PixivPost;
						rgImgUrl: string;
						ogImgUrl: string;
					}
				> => {
					const res = await _res.json();
					const body = res.body;
					return {
						info: {
							url: url,
							id: body.id,
							title: body.title,
							description: body.description,
							pageCount: body.pageCount,
							uploadDate: body.uploadDate,
							userId: body.userId,
							userName: body.userName,
							viewCount: body.viewCount,
							likeCount: body.likeCount,
						},
						rgImgUrl: body.urls.regular,
						ogImgUrl: body.urls.original,
					};
				},
			);
		log('[Data]', info, rgImgUrl, ogImgUrl);

		return Promise.resolve({
			info: info,
			rgImgUrl: rgImgUrl,
			ogImgUrl: ogImgUrl,
		});
	}

	/**
	 * Fetches and downloads Images from base url
	 * @param info Pixiv Post info
	 * @param imgUrl base image url
	 * @param arg path modifiers: 'master' | ' original'
	 * @returns path of download images
	 */
	private async fetchImages(
		info: PixivPost,
		imgUrl: string,
		arg: string,
	): Promise<{ dir: string, files: string[] }> {
		const pageCount = info.pageCount;

		let end;
		switch (arg) {
			case 'master':
				end = '_'; break;
			case 'original':
				end = '.'; break;
			default:
				end = '_'; break;
		}

		// Generate links for images
		const imgUrls: string[] = await this.generateImageUrls(
			imgUrl,
			pageCount,
			end,
		);

		const folder = `${info.id.toString()}`.concat(arg ? `_${arg}` : '');
		const dir = path.join(this.dir, folder);
		await makeDirTo(dir);
		// Download images for images
		return Promise.resolve(await (async () => {
			const _downloaded: string[] = [];
			for (const i in imgUrls) {
				const name = await downloadResponse(dir, await this.page.goto(imgUrls[i], this.opts));
				log('[pushed]', name);
				if (name) _downloaded.push(name);
			}
			return { dir: dir, files: _downloaded };
		})());
	}

	private async generateImageUrls(
		url: string,
		pages: number,
		r: string | RegExp,
	): Promise<string[]> {
		// Generate links for images
		const imgUrlsOut: string[] = [];

		// Create an array with a set size
		const initArray = [];
		for (let i = 0; i < pages; i++) {
			initArray[i] = (i).toString();
		}
		log('[initArray]', initArray);

		// Push generated urls into array
		initArray.forEach((v) =>
			imgUrlsOut.push(url.replace(new RegExp(`_p\\d+${r}`), `_p${v}${r}`)),
		);

		log('[imgUrls]', imgUrlsOut);

		return imgUrlsOut;
	}

	public async onZipRequest(
		msg: Message,
		ctx: {
			url: string,
			info: PixivPost,
			ogImgUrl: string
		},
	): Promise<void> {
		const row = msg.components[0];
		const { url, info, ogImgUrl } = ctx;

		const col = msg.channel.createMessageComponentCollector({ componentType: 'BUTTON', time: 1000 * 60 * 30 });
		let isZipReady = false, obj = {};
		col.on('collect', async (i: MessageComponentInteraction) => {
			if (i.customId == 'zipRequest') {
				if (!isZipReady) {
					row.components[0].setDisabled(true);
					await i.deferReply({ ephemeral: true });
					// Download of original images
					// Create Zip
					const zip = await this.createZipAttachment(url, info, ogImgUrl);
					obj = { ...zip, ephemeral: true };
					await i.followUp(obj);
					// Enable button for downloading
					isZipReady = true;
					row.components[0].setDisabled(false);
				}
				else if (isZipReady) {
					await i.reply(obj);
				}
			}
		});

		col.on('end', async () => {
			row.components[0].setDisabled(true);
		});
	}
}

export interface PixivPost {
	id: string;
	url: string;
	title: string;
	description: string;
	pageCount: number;
	uploadDate: string;
	userId: string;
	userName: string;
	viewCount: number;
	likeCount: number;
}
