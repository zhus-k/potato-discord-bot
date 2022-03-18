import fs from "fs";
import path from "path";
import { Client, Intents } from "discord.js";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v10";
import { clientId, guildId, token } from "./config.json";

import { Command, Event } from "./src/interfaces";
import { SlashCommandBuilder } from "@discordjs/builders";

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

export const commandList = new Map<string, () => any>();

client.once("ready", () => {
  const globals: SlashCommandBuilder[] = []; // Global Commands
  const commands: SlashCommandBuilder[] = []; // Guild Commands

  const commandFilesPaths = recursivelyFindFiles("./src/commands", []);
  for (const filePath of commandFilesPaths) {
    const commandsFile: Command[] = require(`./${filePath}`);
    for (const command of commandsFile) {
      console.log(command);
      commandList.set(command.data.name, command.execute);

      command.global ? globals.push(command.data) : commands.push(command.data);
    }
  }

  console.log("Command Library: ", commandList);

  /**
   * Registering Commands
   */
  const rest = new REST({ version: "9" }).setToken(token);

  (async () => {
    await rest
      .put(Routes.applicationGuildCommands(clientId, guildId), {
        body: commands,
      })
      .then(() => console.log("Successfully registered application commands."))
      .catch(console.error);

    await rest
      .put(Routes.applicationCommands(clientId), {
        body: globals,
      })
      .then(() =>
        console.log("Successfully registered global application commands.")
      )
      .catch(console.error);
  })();

  /**
   * Add listeners for Event files
   */
  const eventFilesPaths = recursivelyFindFiles("./src/events", []);

  for (const filePath of eventFilesPaths) {
    const eventsFile: Event[] = require(`./${filePath}`);
    for (const event of eventsFile) {
      console.log("listening: ", event);
      if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
      } else {
        client.on(event.name, (...args) => event.execute(...args));
      }
    }
  }
});

client.login(token);

export function recursivelyFindFiles(dir: string, out: string[]): string[] {
  let files: string[] = out || [];
  fs.readdirSync(dir, { withFileTypes: true }).forEach((f) => {
    let fullPath = path.join(dir, f.name);
    if (f.isDirectory()) {
      recursivelyFindFiles(fullPath, files);
    } else if (f.isFile() && f.name.endsWith(".ts")) {
      files.push(fullPath);
    }
  });
  return files;
}
