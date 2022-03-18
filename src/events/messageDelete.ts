import { Message } from "discord.js";

module.exports = [
  {
    name: "messageDelete",
    async execute(msg: Message) {
      console.log(`deleted ${msg.channelId}::${msg.id}: '${msg.content}'`);
    },
  },
];
