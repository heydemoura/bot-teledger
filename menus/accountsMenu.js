const {MenuTemplate, MenuMiddleware} = require('telegraf-inline-menu');

const accountsMenu = new MenuTemplate(ctx => `Accounts`);

accountsMenu.interact('Assets', 'assets', {
  do: async (ctx, path) => {
    ctx.reply('assets')
    return true;
  }
});

accountsMenu.interact('Expenses', 'expenses', {
  joinLastRow: true,
  do: async ctx => {
    ctx.reply('account picked')
    return true;
  }
});

accountsMenu.interact('Liabilities', 'liabilities', {
  do: async ctx => {
    ctx.reply('account picked')
    return true;
  }
});

accountsMenu.interact('Income', 'income', {
  joinLastRow: true,
  do: async ctx => {
    ctx.reply('account picked')
    return true;
  }
});


const accountsMenuMiddleware = new MenuMiddleware('/accounts/', accountsMenu);

module.exports.accountsMenu = accountsMenu;
module.exports.accountsMenuMiddleware;

module.exports.init = (bot, ledger) => {
  bot.use(accountsMenuMiddleware);
  bot.hears('a', ctx => accountsMenuMiddleware.replyToContext(ctx));
}
