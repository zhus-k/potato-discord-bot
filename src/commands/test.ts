import { SlashCommandBuilder } from "@discordjs/builders";

module.exports = [
  {
    data: new SlashCommandBuilder().setName("test").setDescription("test"),
    global: false,
    async execute(i: any) {
      await i.reply("TEST!");
    },
  },
];
