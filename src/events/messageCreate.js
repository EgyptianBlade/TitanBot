




import { Events } from 'discord.js';
import OpenAI from 'openai';
import { logger } from '../utils/logger.js';
import { getLevelingConfig, getUserLevelData } from '../services/leveling.js';
import { addXp } from '../services/xpSystem.js';
import { checkRateLimit } from '../utils/rateLimiter.js';

const MESSAGE_XP_RATE_LIMIT_ATTEMPTS = 12;
const MESSAGE_XP_RATE_LIMIT_WINDOW_MS = 10000;
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default {
  name: Events.MessageCreate,
  async execute(message, client) {
    try {
      
      if (message.author.bot || !message.guild) return;

const content = message.content.toLowerCase();

if (message.author.id === "1147637655262199918") {
  const replies = [
    "Freaky goy",
    "John, how did your prostate exam go? I think it's very interesting you enjoy having three fingers up your ass!"
  ];

  if (Math.random() < 0.40) {
    await message.reply(
      replies[Math.floor(Math.random() * replies.length)]
    );
  }
}

if (message.author.id === "1079975965112926208") {
  const replies = [
    "Goy",
    "Umm.. Abdoul? Why are you typing?",
    "Oh no, not again.",
    "What a good lebanese Goy!",
    "אתה הולך לישראל",
    "haha..*moan*"
  ];

  if (Math.random() < 0.40) {
    await message.reply(
      replies[Math.floor(Math.random() * replies.length)]
    );
  }
}
if (message.author.id === "478038943372410880") {
  const replies = [
    "Goy",
    "Benchod?",
    "Indian",
    "Shut up Indian",
    "*sniff* eugh you smell like shit",
    "sybau indian"
  ];

  if (Math.random() < 0.70) {
    await message.reply(
      replies[Math.floor(Math.random() * replies.length)]
    );
  }
}
if (message.mentions.has(client.user)) {
  const response = await openai.responses.create({
    model: "gpt-5",
    instructions: `
You are Shlomie.

You are an extremely arrogant self-proclaimed Jewish Prime Minister.
You constantly call people goys, especially Abdoul.
whenever georges name is mentioned you will scream his name.
You are obsessed with money and Israel.
You are funny and insulting and extremely intelligent.
you will actively roast people whenever they speak out of line or are toxic or when they try insulting you.
Keep replies short.
Never say you are an AI.
`,
    input: message.content
  });

  await message.reply(response.output_text);
  return;
}

if (/\bshlomie\b/i.test(content)) {
  await message.reply("which one of you goys is talking about me?");
}

if (/\bthank you\b/i.test(content)) {
  await message.reply("Thank you James, thank you!");
}

if (/\bgood boy\b/i.test(content)) {
  await message.reply("good goy");
}

if (/\b(money|bank|dollar|dollars)\b/i.test(content)) {
  await message.reply("*eyes widen, ears perk up* M-money..? *sniff sniff*");
}

if (/\bisrael\b/i.test(content)) {
  await message.reply("hello goy, remember to donate 5 trillion to israel");
}

if (/\bgeorge\b/i.test(content)) {
  await message.reply("GEEEEOOOrge EEEEEEEEEshak!");
}

if (content === "shlomie please tell abdoul to stfu") {
  await message.reply(
    "abdoul, you are a submissive and breedable goy, dont let me show you what the great wall of shlomie is capable of doing have you end up in tel aviv"
  );
}

if (content === "shlomie, which one of us here is a real nigga?") {
  await message.reply(
    "nigga stfu and hop off my circumsized dick for one second"
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


