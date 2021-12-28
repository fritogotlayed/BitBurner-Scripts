/* TODO: Update what this scripts intention is
 */

const FILES_METADATA = {
  'BruteSSH.exe': { cost: -1 },
  'FTPCrack.exe': { cost: -1 },
  'relaySMTP.exe': { cost: -1 },
  'HTTPWorm.exe': { cost: -1 },
  'SQLInject.exe': { cost: -1 },
  'DeepscanV1.exe': { cost: -1 },
  'DeepscanV2.exe': { cost: -1 },
  'ServerProfiler.exe': { cost: -1 },
  'AutoLink.exe': { cost: -1 },
};

const MONEY_PERCENTAGE = 0.5; // We gotta spend money to make money

const FILES = [
  'BruteSSH.exe',
  'FTPCrack.exe',
  'relaySMTP.exe',
  'HTTPWorm.exe',
  'SQLInject.exe',
  'DeepscanV1.exe',
  'DeepscanV2.exe',
  'ServerProfiler.exe',
  'AutoLink.exe',
];

/**
 * @param {import(".").NS} ns Use just "@param {NS} ns" if editing in game
 */
export async function main(ns) {
  // TODO: Is this script even worth writing given after you buy the augs you start with
  // the various exes?
  ns.disableLog('sleep');
  let running = true;
  let workingMoney = -1;
  // ns.purchaseTor(); // TODO: Figure out a way to tell if this is done already.

  while (running) {
    workingMoney = ns.getPlayer().money * MONEY_PERCENTAGE;

    let allExist = true;
    try {
      for (const file of FILES) {
        if (!ns.fileExists(file, 'home')) {
          allExist = false;
          if (FILES_METADATA[file].cost <= workingMoney) {
            ns.purchaseProgram(file);
            workingMoney = workingMoney - FILES_METADATA[file].cost;
          }
        }
      }
    } catch (err) {
      allExist = false;
      ns.toast(
        'Purchase of hack EXE failed. Do you have the TOR router?',
        'warning',
      );
    }

    if (allExist) {
      running = false;
    }

    await ns.sleep(60 * 1000);
  }
}
