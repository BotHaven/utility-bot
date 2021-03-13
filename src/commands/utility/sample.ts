import { Npc, NpcMortal, npcs } from "@bothaven/common";
import { Command } from "discord-akairo";
import { Collection } from "discord.js";
import { MessageCollector } from "discord.js";
import { TextChannel } from "discord.js";
import { Message } from "discord.js";
import config from "../../config";

export default class TBD extends Command {
  constructor() {
    super("imitate npc", {
      aliases: ["imitate", "imitate-full", "imitate-primary", "imitate-secondary"],
      channel: "guild",
      category: "utility",
      description: "imitate npc",
    });
  }
  *args(message: Message) {
    const cmd = message.content.split(" ").slice(1,2)[0]    
    let embedType;
    if(cmd !== "imitate"){
        embedType = cmd.split("-")[1].toUpperCase();
    }else {
        embedType = "DEFAULT";
    }
    

    const messageCollector = message.channel.createMessageCollector(
      (m) => true,
      { time: 3e5 }
    );
    /* Choose Channel */
    const _channel = yield {
      type: "channel",
      prompt: {
        start: "test start",
        timeout: "test timeout",
        ended: "test end",
        retry: "test retry",
        cancel: "test cancel",
      },
    };

    /* Choose Npc */
    const availableNpcs: any = Object.values(npcs.bots).map((e) => new e());
    const availableImmortals = Object.values(npcs.immortals).map(
      (e) => new e()
    );
    const availableImmatations = availableNpcs.concat(...availableImmortals);
    // const bigShaq = new npcs.immortals.BigManInFrontOfYou()
    // const one = bigShaq.think({description: "1", embedBaseType: "FULL"})
    // const two = bigShaq.think({description: "2"}).setThumbnail(bigShaq.primary as string).setImage(bigShaq.secondary as string);
    // console.log(one,two);
    // message.reply(one)
    // message.reply(two)

    const names = availableImmatations.map((value) => value.name);
    const type = names.concat(...names.map((_, i) => (i + 1).toString()));
    const description = names.map((e, i) => `> ${i + 1}. ${e}`).join("\n");
    let _npcName = yield {
      type,
      prompt: {
        start: config.bot.think({
          title: "Choose an npc to imitate.",
          description,
        }),
        timeout: "name timeout",
        ended: "name end",
        retry: "name retry",
        cancel: "name cancel",
      },
    };
    if (!isNaN(_npcName)) {
      _npcName = names[_npcName - 1];
    }
    const npc = availableImmatations.find((e) => e.name === _npcName);

    /* Choose Title */
    const _title = yield {
      type: "content",
      time: 3e5,
      prompt: {
        start: "Title",
        retry: "retry",
        ended: "ended",
        cancel: "cancelled",
        timeout: "timeout",
        time: 3e5,
      },
    };

    /* Choose Descriptiom */
    const _description = yield {
      type: "content",
      time: 3e5,
      prompt: {
        start: "description",
        retry: "retry",
        ended: "ended",
        cancel: "cancelled",
        timeout: "timeout",
        time: 3e5,
      },
    };

    return { _channel, npc, _title, _description, messageCollector, embedType };
  }
  exec(
    message: Message,
    args: {
      _channel: TextChannel;
      npc: Npc;
      _description: string;
      _title: string;
      messageCollector: MessageCollector;
      embedType: string;
    }
  ) {
    const { _channel, npc, _description, embedType, _title } = args;
    type baseEmbedType = "DEFAULT" | "FULL" | "PRIMARY" | "SECONDARY";
    _channel.send(
      npc.think({ title: _title, description: _description, embedBaseType: embedType as baseEmbedType || "DEFAULT" })
    );

    args.messageCollector.collected.forEach((m) => m.deletable && m.delete());
    args.messageCollector.dispose(message);
    message.delete();
    if (_channel.id !== message.channel.id) {
      message
        .reply(
          config.bot.think({
            title: "Imitated " + npc.name,
            description: `Posted the imitation in ${_channel}.`,
            embedBaseType: "PRIMARY",
          })
        )
        .then((m) => {
          m.delete({ timeout: 7500 });
        });
    }
  }
}
