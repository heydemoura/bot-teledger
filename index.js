const { Telegraf } = require("telegraf");
const session = require("telegraf/session");

// Menus
const newTransactionMenu = require("./menus/newTransactionMenu");

const { createLedger } = require("./lib/ledger");

const ledger = createLedger(process.env.JOURNAL_FILE);
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

const processBalanceFromCtx = (ctx, filter) => {
  const balance = ledger.balance(`^${filter}`);
  return balance;
};

bot.command("income", (ctx) => ctx.reply(processBalanceFromCtx(ctx, "income")));
bot.command("expenses", (ctx) =>
  ctx.reply(processBalanceFromCtx(ctx, "expenses"))
);
bot.command("liab", (ctx) =>
  ctx.reply(processBalanceFromCtx(ctx, "liabilities"))
);
bot.command("assets", (ctx) => ctx.reply(processBalanceFromCtx(ctx, "assets")));

bot.command("bal", (ctx) => {
  const { message } = ctx;
  const [, ...filters] = message.text.split(" ");
  const balance = ledger.balance(
    filters.map((filter) => `^${filter}`).join(" ")
  );
  ctx.reply(balance);
});

bot.command("reg", (ctx) => {
  const { message } = ctx;
  const [, ...filters] = message.text.split("");
  const register = ledger.register(
    filters.map((filter) => `^${filter}`).join(" ")
  );
  ctx.reply(register);
});

// Middlewares
newTransactionMenu(bot, ledger);

bot.help((ctx) => ctx.reply("Send a sticker"));

bot.launch();
