import { Listener } from 'discord-akairo';
import { GuildChannel } from 'discord.js';
import { User } from 'discord.js';
import { MessageReaction } from 'discord.js';
import config from '../config';
import {City, mapOfAlbion} from "@the-land-of-albion/common"
import { RoleResolvable } from 'discord.js';
import { Role } from 'discord.js';

class ReadyListener extends Listener {
    constructor() {
        super('reaction', {
            emitter: 'client',
            event: 'messageReactionAdd',
        });
        
    }
    

    async exec(r: MessageReaction, u: User) {
        /* Validation */
        if(u.bot) return;
        if(r.partial) try {
            await r.fetch();
        } 
        catch(err){
            console.log("Something went wrong trying to fetch reaction. " + new Date().toLocaleString());
            return;
        }
        
        const member = r.message.guild?.members.cache.get(u.id);
        const channelName = (<GuildChannel>r.message.channel).name;
        const selectedCity = Array.from(mapOfAlbion.cities.values()).find((c) => c.emojiName === r.emoji.name.toLocaleLowerCase()) as City;

        if(channelName === "stables"){
            // perform the code
            r.users.remove(u);
                    //@ts-ignore
                    const previousCity: City = Array.from(mapOfAlbion.cities.values()).find((c) => c.name === (<GuildChannel>r.message.channel).parent.name.toUpperCase());
                    
                    // Permit view new
                    const newCityRole = r.message.guild?.roles.cache.find((role) => {
                        const iteratorName = role.name.toUpperCase()
                        const againstName = selectedCity.name
                        return iteratorName === againstName;
                        });
                    const previousCityRole = member?.roles.cache.find((role) => {
                        const iteratorName = role.name.toUpperCase()
                        const againstName = previousCity?.name
                        return iteratorName === againstName;
                        });
                    
                        try {
                            member?.roles.add(newCityRole as RoleResolvable).catch(() => console.log("Something went wrong adding or removing a role."))
                            member?.roles.remove(previousCityRole as RoleResolvable).catch(()=>console.log("Something went wrong adding or removing a role."));
                        } catch(err){
                            console.log("Something went wrong adding or removing a role.")
                        }
        }
        else if (channelName === "dragon"){
            r.users.remove(u);
            const cityRoles = Array.from(mapOfAlbion.cities.values()).map((c) => c.roleId);
            try {
                cityRoles.forEach((r) => member?.roles.cache.has(r) && member?.roles.remove(r));
                const role = r.message.guild?.roles.cache.find((r)=> {
                    const roleName = r.name.toLocaleLowerCase();
                    const selectedEmojiCityName = selectedCity.name.toLocaleLowerCase();
                    return roleName === selectedEmojiCityName});
                member?.roles.add(role as Role);
            }catch(err){console.log("something went wrong")}
        }

    }
}

export default ReadyListener;