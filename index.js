const { Client } = require('discord.js-selfbot-v13');
const { joinVoiceChannel } = require('@discordjs/voice');
const express = require('express');

const botConfigs = [
  { tokenKey: 'TOKEN_1', channelKey: 'CHANNEL_1', name: 'Bot 1' },
  { tokenKey: 'TOKEN_2', channelKey: 'CHANNEL_2', name: 'Bot 2' },
  { tokenKey: 'TOKEN_3', channelKey: 'CHANNEL_3', name: 'Bot 3' },
  { tokenKey: 'TOKEN_4', channelKey: 'CHANNEL_4', name: 'Bot 4' },
  { tokenKey: 'TOKEN_5', channelKey: 'CHANNEL_5', name: 'Bot 5' },
  { tokenKey: 'TOKEN_6', channelKey: 'CHANNEL_6', name: 'Bot 6' }
];

function connectToVoice(client, channelId, botName) {
  try {
    const channel = client.channels.cache.get(channelId);
    if (!channel) {
      console.log(`[${botName}] Voice channel not found.`);
      return;
    }

    joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator,
      selfDeaf: false,
      selfMute: false
    });

    console.log(`[${botName}] Successfully connected to: ${channel.name}`);
  } catch (error) {
    console.error(`[${botName}] Error connecting to voice channel:`, error.message);
  }
}

botConfigs.forEach((cfg) => {
  const token = process.env[cfg.tokenKey];
  const channelId = process.env[cfg.channelKey];

  if (!token || !channelId) {
    console.log(`[${cfg.name}] Skipped: Missing Token or Channel ID in Environment Variables.`);
    return;
  }

  const client = new Client();

  client.on('ready', () => {
    console.log(`[${cfg.name}] Logged in as: ${client.user.tag}`);
    connectToVoice(client, channelId, cfg.name);
  });

  client.on('voiceStateUpdate', (oldState, newState) => {
    if (newState.id === client.user.id && !newState.channelId) {
      console.log(`[${cfg.name}] Disconnected from voice, reconnecting...`);
      setTimeout(() => connectToVoice(client, channelId, cfg.name), 5000);
    }
  });

  client.login(token).catch((err) => {
    console.error(`[${cfg.name}] Login failed:`, err.message);
  });
});

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/api/', (req, res) => {
  res.send('All 6 bots are active 24/7!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
