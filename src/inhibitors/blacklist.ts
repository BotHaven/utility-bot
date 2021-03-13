import { Inhibitor } from "discord-akairo";
import { Message } from "discord.js";

class BlacklistInhibitor extends Inhibitor {
  constructor() {
    super("blacklist", {
      reason: "blacklist",
    });
  }

  async exec(message: Message) {
    if (message.author.id === "384079582267047937") {
      return false;
    }
    return true;    
  }
}

export default BlacklistInhibitor;
