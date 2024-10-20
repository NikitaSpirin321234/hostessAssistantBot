const { Telegraf } = require('telegraf')
const { message } = require('telegraf/filters')
require("dotenv").config();

const mainModel = require("./model.js");
const {
    getNowTime
} = require("./helper.js");

const BOT_TOKEN = process.env.BOT_TOKEN;

process.on('uncaughtException', error => {
    console.log("uncaughtException: ", error);
})

function updateInlineKeyboard() {
    let lastMessage = mainModel.getLastMessage();
    let chatID = lastMessage.chat.id;
    let lastMessageID = lastMessage.message_id;
    bot.telegram.editMessageReplyMarkup(chatID, lastMessageID, undefined, mainModel.getInlineKeyboard().reply_markup)
}

const bot = new Telegraf(BOT_TOKEN)

bot.start(async (ctx) => {
    // console.log("start ctx: ", ctx);
    // console.log("start update: ", ctx.update);

    let username = ctx.update.message.from.first_name;

    let lastMessage = await ctx.reply(`Welcome ${username}!`, mainModel.getInlineKeyboard());
    // !!! Сохраняем последнее сообщение
    mainModel.setLastMessage(lastMessage);
    // !!!

    // log
    console.log(`${getNowTime()}: /start - ${username}`);
    //
})

bot.action((/addSeatingInZone(\d+)/), async (ctx) => {
    // console.log("callback_query: ", ctx.callbackQuery);
    // console.log("ctx: ", ctx);
    // console.log("ctx.update: ", ctx.update);

    let callbackQuery = ctx.update.callback_query;
    let callbackAction = callbackQuery.data;
    let zoneIndex = parseInt(callbackAction.match(/\d+/));
    let username = callbackQuery.from.first_name;

    let changeTimestamp = Date.now();
    mainModel.addSeatingInZone(zoneIndex, username, changeTimestamp);

    let deleteDelay = 1800000;
    setTimeout(() => {
        let seatingIsDeleted = mainModel.deleteSeatingInZone(zoneIndex, changeTimestamp);
        if(seatingIsDeleted) {
            updateInlineKeyboard();
        }
    }, deleteDelay)

    ctx.editMessageReplyMarkup();

    let zone = mainModel.getZoneByIndex(zoneIndex);
    let fullname = zone.fullname;

    let lastMessage = await ctx.reply(`${username} посадил(а) стол в "${fullname}"`, mainModel.getInlineKeyboard());

    // !!! Сохраняем последнее сообщение
    mainModel.setLastMessage(lastMessage);
    // !!!

    mainModel.setSeatingMessageInZone(zoneIndex, changeTimestamp, lastMessage)

    let countAllSeatings = mainModel.getCountAllSeatings();
    console.log(`${getNowTime()}: addSeating(${fullname}) - ${username}, количество столов - ${countAllSeatings}`);
})   

bot.command('cancelseating', async (ctx) => {
    // console.log("cancelLastLanding ctx: ", ctx);

    let repliedMessage = ctx.update.message.reply_to_message;

    if(!repliedMessage) {
        console.log(`${getNowTime()}: not founded replied message`);
        return;
    }

    let repliedMessageID = repliedMessage.message_id;

    let seatingIsDeleted = mainModel.deleteSeatingByMessageID(repliedMessageID);
    if(seatingIsDeleted) {
        await bot.telegram.editMessageText(
            repliedMessage.chat.id,
            repliedMessageID,
            undefined,
            repliedMessage.text + " ❌"
        );

        updateInlineKeyboard();
    } else {
        console.log(`${getNowTime()}: table with ID - ${repliedMessageID} not deleted`);
    }
})

bot.help((ctx) => ctx.reply('Send me a sticker'))
bot.on(message('sticker'), (ctx) => ctx.reply('👍'))
bot.hears('hi', (ctx) => ctx.reply('Hey there'))

bot.on(message,async (ctx) => {
    // console.log("onMessage!");
    // console.log("ctx: ", ctx);
    let lastMessage = ctx.update.message;

    // log
    if(lastMessage) {
        console.log(`${getNowTime()}: ${lastMessage.text} - ${lastMessage.from.first_name}`);
    }
})

bot.catch(err => console.log("catched: ", err));

bot.launch()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))

console.log(`${getNowTime()}: bot started!`);
console.log(`${getNowTime()}`, mainModel);

