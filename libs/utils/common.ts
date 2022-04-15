import fs from 'fs';
import path from 'path';
import { MessageAttachment, MessageEmbed } from 'discord.js';
import { HTTPResponse } from 'puppeteer';
import { temp } from '../../bot';
import { PixivPost } from '../modules/pixiv/pixiv';

/**
 * Downloads a Resource/Asset of HTTPResponse
 * @param res HTTPResponse
 * @returns Absolute file path of successfully downloaded file or void if file is not found
 */
export const downloadResponse = async (
	dir: string,
	res: HTTPResponse,
): Promise<string | void> => {
	const url = res.url();

	const fileName = url.split('/').pop();
	if (!fileName) return Promise.resolve();

	const filePath = path.join(dir, fileName);
	log('[Download] downloading: ' + filePath);
	fs.writeFile(filePath, await res.buffer(), () => {
		log('[Download]', 'completed', filePath);
	});
	return Promise.resolve(filePath);
};

/**
 * Make Dir
 * @param dirname Path of dir
 */
export const makeDirTo = async (dirname: string): Promise<string | void> => {
	return fs.mkdirSync(dirname, { recursive: true });
};

/**
 * Delete Files from Temp
 * @param _files Array of file paths
 */
export const deleteFiles = (_files: string | string[]) => {
	const files: string[] = [..._files];
	for (const file of files) {
		fs.unlink(file, () => {
			log('[File Deleted]', 'successfully');
		});
	}
};

/**
 * Delete Temp
 */
export const clearTemp = async () => {
	fs.rm(temp, { recursive: true }, (err) => {
		if (err) error(err);
		log('[rmdir]', 'temp deleted');
		fs.mkdir(temp, (_err) => {
			if (_err) error(_err);
			log('[mkdir]', 'temp created');
		});
	});
};

/**
 * Check if Argument contains Flag
 * @param args arguments to check for Flags
 * @param flags Flags to check
 * @returns true if Flag present in args
 */
export const checkForFlag = (
	args: string[],
	flags: string | string[],
): boolean => {
	return [...flags].some((f) => {
		return args.indexOf(f) >= 1;
	});
};

/**
 * Create Embedded Message with Image file
 * @param urls Array of image file paths
 * @returns Object of Embeds Array and Files Array
 */
export const createEmbeddedMessagesWithImage = async (
	info: PixivPost,
	urls: string[],
	compact = false,
): Promise<{ embeds: MessageEmbed[]; files: MessageAttachment[] }> => {
	const embedsOut: MessageEmbed[] = [];
	const filesOut: MessageAttachment[] = [];
	for (const i in urls) {
		const url = urls[i];
		if (url) {
			const file = new MessageAttachment(url);
			const fileName = url.split(/\\/).pop();
			const title = `[${info.id}] ${info.title}` + (compact
				? ''
				: ` ${Number(i) + 1}/${info.pageCount}`);
			// log('[Title]', title);
			const em = new MessageEmbed()
				.setTitle(title)
				.setImage(`attachment://${fileName}`)
				.setURL(info.url);
			embedsOut.push(em);
			filesOut.push(file);
		}
	}
	// log('[Out]', embedsOut, filesOut);
	return Promise.resolve({ embeds: [...embedsOut], files: [...filesOut] });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const error = (...message: any | any[]) => {
	console.error('[Error]', ...message);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const log = (...message: any | any[]) => {
	console.log(...message);
};

export function recursivelyFindFiles(dir: string, out: string[]): string[] {
	const files: string[] = out || [];
	fs.readdirSync(dir, { withFileTypes: true }).forEach((f) => {
		const fullPath = path.join(dir, f.name);
		if (f.isDirectory()) {
			recursivelyFindFiles(fullPath, files);
		}
		else if (f.isFile() && f.name.endsWith('.ts')) {
			files.push(fullPath);
		}
	});
	return files;
}
