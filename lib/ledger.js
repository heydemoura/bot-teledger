const path = require('path');
const { exec, execSync } = require('child_process');

module.exports.createLedger = function createLedger(ledgerFile) {
  const balance = function balance(filters = '') {
    const response = execSync(`ledger -f ${ledgerFile} balance ${filters}`, {
      encoding: 'utf-8'
    });

    return response;
  }

  const accounts = function accounts(filters = '') {
    const response = execSync(`ledger -f ${ledgerFile} accounts ${filters}`, {
      encoding: 'utf-8'
    });

    return response;
  }

  return {
    accounts,
    balance
  }
}
