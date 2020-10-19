const fs = require("fs");
const { execSync } = require("child_process");

module.exports.createLedger = function createLedger(ledgerFile) {
  const balance = function balance(filters = "") {
    const response = execSync(`ledger -f ${ledgerFile} balance ${filters}`, {
      encoding: "utf-8",
    });

    return response;
  };

  const accounts = function accounts(filters = "") {
    const response = execSync(`ledger -f ${ledgerFile} accounts ${filters}`, {
      encoding: "utf-8",
    });

    return response;
  };

  const register = function register(filters = "") {
    const response = execSync(
      `ledger -f ${ledgerFile} --tail 10 register ${filters}`,
      {
        encoding: "utf-8",
      }
    );
    return response;
  };

  const write = function write(report) {
    const response = fs.readFileSync(ledgerFile, {
      encoding: "utf-8",
    });

    fs.writeFileSync(ledgerFile, `${response}\n${report}`, {
      encoding: "utf-8",
    });

    return `${report}`;
  };

  return {
    accounts,
    balance,
    register,
    write,
  };
};
