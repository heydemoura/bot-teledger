const moment = require("moment");
const _ = require("lodash");
const {
  MenuTemplate,
  MenuMiddleware,
  replyMenuToContext,
  deleteMenuFromContext,
} = require("telegraf-inline-menu");

class Transaction {
  constructor(description, accountFrom, accountTo, amount, currency = "R$") {
    this.from = accountFrom;
    this.to = accountTo;
    this.amount = amount;
    this.currency = currency;
    this.description = description;
    this.date = new Date();
  }

  setFrom(from) {
    this.from = from;
  }

  setTo(to) {
    this.to = to;
  }

  setDescription(description) {
    this.description = description;
  }

  setAmount(amount) {
    this.amount = amount;
  }

  isValid() {
    return (
      this.amount &&
      this.from &&
      this.to &&
      this.description &&
      this.date &&
      this.currency
    );
  }

  toString() {
    return `${moment(this.date).format("YYYY/MM/DD")} ${this.description}\n\t${
      this.to
    }  ${this.currency} ${this.amount}\n\t${this.from}\n`;
  }
}

module.exports = (bot, ledger) => {
  const assetsAccounts = ledger.accounts("^assets");
  const expensesAccounts = ledger.accounts("^expenses");
  const liabilitiesAccounts = ledger.accounts("^liabilities");

  // Menus
  const accountPickerMenu = new MenuTemplate((ctx) => {
    const { transaction } = ctx.session;
    if (!transaction.to) {
      return `${transaction.toString()}\n\nWhich account to pay to?`;
    }

    if (!transaction.from) {
      return `${transaction.toString()}\n\nWhich account to pay with?`;
    }

    if (transaction.from && transaction.to) {
      return ctx.session.transaction.toString();
    }

    return `*New transaction*\n${transaction.toString()}`;
  });

  const accAssetsMenu = new MenuTemplate((ctx) =>
    ctx.session.transaction.toString()
  );
  const accExpensesMenu = new MenuTemplate((ctx) =>
    ctx.session.transaction.toString()
  );
  const accLiabilitiesMenu = new MenuTemplate((ctx) => "Liabilities Accounts");

  accAssetsMenu.choose("pick-assets", assetsAccounts.split("\n"), {
    columns: 1,
    do: async (ctx, key) => {
      if (ctx.session.transaction.to) {
        ctx.session.transaction.from = key;
      } else {
        console.log(key);
        ctx.session.transaction.to = key;
      }
      return "..";
    },
  });

  accExpensesMenu.choose("acc-type", expensesAccounts.split("\n"), {
    columns: 4,
    do: async (ctx, key) => {
      if (ctx.session.transaction.to) {
        ctx.session.transaction.from = key;
      } else {
        ctx.session.transaction.to = key;
      }
      return "..";
    },
    buttonText: (ctx, text) => {
      if (text) {
        return text.split("Expenses:")[1];
      }

      return text;
    },
  });

  accLiabilitiesMenu.choose("acc-type", liabilitiesAccounts.split("\n"), {
    columns: 3,
    do: async (ctx, key) => {
      if (ctx.session.transaction.to) {
        ctx.session.transaction.from = key;
      } else {
        ctx.session.transaction.to = key;
      }

      return "..";
    },
    buttonText: (ctx, text) => {
      if (text) {
        return text.split("Liabilities:")[1];
      }

      return text;
    },
  });

  accountPickerMenu.submenu("💰 Assets", "assets", accAssetsMenu);
  accountPickerMenu.submenu("💸 Expenses", "expenses", accExpensesMenu, {
    joinLastRow: true,
  });

  accountPickerMenu.submenu("💳 Liabilities", "liab", accLiabilitiesMenu, {});

  accountPickerMenu.submenu("💎 Income", "income", accLiabilitiesMenu, {
    joinLastRow: true,
  });

  accountPickerMenu.interact("Save Transaction", "save", {
    do: async (ctx) => {
      if (ctx.session.transaction.isValid()) {
        console.log(">> Saving transaction");
        console.log(ledger.write(ctx.session.transaction.toString()));
        await deleteMenuFromContext(ctx);
        return false;
      }

      ctx.reply("Your transaction is not yet full");
      return false;

      //      ctx.reply(ctx.session.transaction.toString());
    },
  });
  accountPickerMenu.interact("Clear Transaction", "delete", {
    do: async (ctx) => {
      ctx.session.transaction = new Transaction();
      await deleteMenuFromContext(ctx);
      return false;
    },
  });

  const accountPickerMenuMiddleware = new MenuMiddleware(
    "/account-picker/",
    accountPickerMenu
  );
  const accAssetsMenuMiddleware = new MenuMiddleware(
    "/assets-picker/",
    accAssetsMenu
  );
  const accExpensesMenuMiddleware = new MenuMiddleware(
    "/expenses-picker/",
    accExpensesMenu
  );
  const accLiabilitiesMenuMiddleware = new MenuMiddleware(
    "/liabilities-picker/",
    accLiabilitiesMenu
  );

  bot.use(async (ctx, next) => {
    if (!ctx.session.transaction) ctx.session.transaction = new Transaction();

    return next();
  });

  bot.use(accAssetsMenuMiddleware);
  bot.use(accExpensesMenuMiddleware);
  bot.use(accLiabilitiesMenuMiddleware);
  bot.use(accountPickerMenuMiddleware);
  bot.on("text", (ctx) => {
    const newTransactionMatch = /^\d+ \w+$/.test(ctx.message.text);
    if (newTransactionMatch) {
      const [amount, description] = ctx.message.text.split(" ");
      ctx.session.transaction.setAmount(_.toNumber(amount));
      ctx.session.transaction.setDescription(description);
      return accountPickerMenuMiddleware.replyToContext(ctx);
    }
  });
};
