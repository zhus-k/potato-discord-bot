import { CommandInteraction } from "discord.js";
import { commandList } from "../../index";

module.exports = [
  {
    name: "interactionCreate",
    async execute(i: CommandInteraction) {
      console.log("interaction: ", i);
      const { commandName } = i;

      if (i.isCommand()) {
        try {
          await commandList.get(commandName)?.(i);
        } catch (error) {
          console.error(error);
          return i.reply({
            content: "There was an error while executing this command!",
            ephemeral: true,
          });
        }
      }
      if (i.isSelectMenu()) {
        try {
          await commandList.get(commandName)?.(i);
        } catch (error) {
          console.error(error);
          return i.reply({
            content:
              "There was an error while executing this menu interaction!",
            ephemeral: true,
          });
        }
      }
    },
  },
];
