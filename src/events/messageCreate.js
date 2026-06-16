




import { Events } from 'discord.js';
import { logger } from '../utils/logger.js';
import { getLevelingConfig, getUserLevelData } from '../services/leveling.js';
import { addXp } from '../services/xpSystem.js';
import { checkRateLimit } from '../utils/rateLimiter.js';

const MESSAGE_XP_RATE_LIMIT_ATTEMPTS = 12;
const MESSAGE_XP_RATE_LIMIT_WINDOW_MS = 10000;

export default {
  name: Events.MessageCreate,
  async execute(message, client) {
    try {
      
      if (message.author.bot || !message.guild) return;

const content = message.content.toLowerCase();

if (content === "shlomie") {
  await message.reply("which one of you goys is talking about me");
}

if (message.mentions.has(client.user)) {
  await message.reply("If I hear my name being mentioned one more time by one of you fuck niggas I'll rob all of you");
}
if (/\b(money|bank|dollar|dollars)\b/i.test(content)) {
  await message.reply("*eyes widen, ears perk up* M-money..? *sniff sniff*");
}
if (/\israel\b/i.test(content)) {
  await message.reply("hello goy, remember to donate 5 trillion to israel");
}
      if (content === "shlomie please tell abdoul to stfu") {
  await message.reply("abdoul, you are a submissive and breedable goy, dont let me show you what the great wall of shlomie is capable of doing have you end up in til aviv");
}
      if (content === "shlomie, which one of us here is a real nigga?") {
  await message.reply("nigga stfu and hop off my circumsized dick for one second");
}

      if (/\bgood boy\b/i.test(content)) {
  await message.reply("good goy");
}
      if (message.author.id === "1079975965112926208") {
  const replies = [
    "Fuck nigga",
    "Goy",
    "Umm.. Abdoul? Why are you typing?",
    "Oh no, not again.",
    "What a good lebanese Goy!",
    "אתה הולך לישראל"
  ];

       if (/\bshlomie\b/i.test(content)) {
  await message.reply("which one of you goys is talking about me?");
}
      if (/\bthank you\b/i.test(content)) {
  await message.reply("Thank you James, thank you!");
}
      if (message.mentions.has(client.user)) {
  const replies = [
    "If I hear my name being mentioned one more time by one of you fuck niggas I'll rob all of you",
    "Oh my god bro",
    "That's it, I'm calling my boy Yahu",
    "מה אתה רוצה גוי"
  ];

  return message.reply(
    replies[Math.floor(Math.random() * replies.length)]
  );
}
await handleLeveling(message, client);
    } catch (error) {
      logger.error('Error in messageCreate event:', error);
    }
  }
};








async function handleLeveling(message, client) {
  try {
    const rateLimitKey = `xp-event:${message.guild.id}:${message.author.id}`;
    const canProcess = await checkRateLimit(rateLimitKey, MESSAGE_XP_RATE_LIMIT_ATTEMPTS, MESSAGE_XP_RATE_LIMIT_WINDOW_MS);
    if (!canProcess) {
      return;
    }

    const levelingConfig = await getLevelingConfig(client, message.guild.id);
    
    if (!levelingConfig?.enabled) {
      return;
    }

    
    if (levelingConfig.ignoredChannels?.includes(message.channel.id)) {
      return;
    }

    
    if (levelingConfig.ignoredRoles?.length > 0) {
      const member = await message.guild.members.fetch(message.author.id).catch(() => {
        return null;
      });
      if (member && member.roles.cache.some(role => levelingConfig.ignoredRoles.includes(role.id))) {
        return;
      }
    }

    
    if (levelingConfig.blacklistedUsers?.includes(message.author.id)) {
      return;
    }

    
    if (!message.content || message.content.trim().length === 0) {
      return;
    }

    const userData = await getUserLevelData(client, message.guild.id, message.author.id);
    
    
    const cooldownTime = levelingConfig.xpCooldown || 60;
    const now = Date.now();
    const timeSinceLastMessage = now - (userData.lastMessage || 0);
    
    
    if (timeSinceLastMessage < cooldownTime * 1000) {
      return;
    }

    
    const minXP = levelingConfig.xpRange?.min || levelingConfig.xpPerMessage?.min || 15;
    const maxXP = levelingConfig.xpRange?.max || levelingConfig.xpPerMessage?.max || 25;

    
    const safeMinXP = Math.max(1, minXP);
    const safeMaxXP = Math.max(safeMinXP, maxXP);

    
    const xpToGive = Math.floor(Math.random() * (safeMaxXP - safeMinXP + 1)) + safeMinXP;

    
    let finalXP = xpToGive;
    if (levelingConfig.xpMultiplier && levelingConfig.xpMultiplier > 1) {
      finalXP = Math.floor(finalXP * levelingConfig.xpMultiplier);
    }

    
    const result = await addXp(client, message.guild, message.member, finalXP);
    
    if (result.success && result.leveledUp) {
      logger.info(
        `${message.author.tag} leveled up to level ${result.level} in ${message.guild.name}`
      );
    }
  } catch (error) {
    logger.error('Error handling leveling for message:', error);
  }
}


