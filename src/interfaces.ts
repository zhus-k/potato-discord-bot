import { SlashCommandBuilder } from "@discordjs/builders";

export interface Event {
  name: string;
  once?: boolean;
  execute: (...args: any[]) => any;
}

export interface Command {
  data: SlashCommandBuilder;
  global: boolean;
  execute: (...args: any[]) => any;
}
