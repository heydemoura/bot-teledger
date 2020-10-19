const { Telegraf } = require("telegraf");
const session = require("telegraf/session");

// Menus
const newTransactionMenu = require("./menus/newTransactionMenu");

const { createLedger } = require("./lib/ledger");

const ledger = createLedger("./journal.dat");
const bot = new Telegraf(process.env.TELEGRAM_TOKEN);

bot.start((ctx) => {
  ctx.reply("Welcome");
});

bot.use(session());

bot.use((ctx, next) => {
  if (ctx.callbackQuery) {
    console.info("callback data just happened", ctx.callbackQuery.data);
  }
  return next();
});

// Middlewares
newTransactionMenu(bot, ledger);

bot.help((ctx) => ctx.reply("Send a sticker"));
bot.hears("bal", (ctx) => {
  console.log(ctx.message);
  ctx.reply("Hey there");
});

bot.launch();
