import { Message } from "discord.js";

module.exports = [
  {
    name: "messageDeleteBulk",
    async execute(msg: Message[]) {
      console.log('bulk delete: ');
      msg.forEach(m => console.log(`${m.channelId}::${m.id}: '${m.content}'`));
    },
  },
];
