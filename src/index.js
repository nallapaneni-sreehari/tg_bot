const TelegramBot = require('node-telegram-bot-api');
const {BOT_TOKEN} = require('../config/config');

const bot = new TelegramBot(BOT_TOKEN, {polling: true});

bot.on('message', (msg)=>{
    console.log(`MSG :: `, msg);
    const chatId = msg.chat.id;

    bot.sendMessage(chatId, 'Hello World!');
});