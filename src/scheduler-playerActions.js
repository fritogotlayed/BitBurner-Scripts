/* TODO: Coordinates various scriptable player actions.
 */

import { FILES_METADATA } from './libs/files';

const MONEY_PERCENTAGE = 0.5; // We gotta spend money to make money

const FILES = Object.keys(FILES_METADATA);

/**
 * @param {object} args
 * @param {import(".").NS} args.ns Use just "@param {NS} ns" if editing in game
 */
function writeOrPurchaseProgram({ ns, currentMoney, shouldBuy }) {
  let allExist = true;
  let workingMoney = currentMoney;
  try {
    for (const file of FILES) {
      if (!ns.fileExists(file, 'home') && !ns.isBusy()) {
        allExist = false;
        // TODO: Consider writing program if proper sourcefile in place and player has "int" property
        if (shouldBuy) {
          if (
            FILES_METADATA[file].cost <= workingMoney &&
            FILES_METADATA[file].isNukeTool
          ) {
            ns.purchaseProgram(file, true);
            workingMoney = workingMoney - FILES_METADATA[file].cost;
          }
        } else {
          if (FILES_METADATA[file].isNukeTool) {
            ns.createProgram(file, true);
          }
        }
      }
    }
  } catch (err) {
    allExist = false;
    ns.tprint(err.message);
    ns.toast(
      'Purchase of hack EXE failed. Do you have the TOR router?',
      'warning',
    );
  }

  // Not sure if this is the best approach. Trying something to see how it works scaling.
  return { noMoreActions: allExist, isBusy: ns.isBusy() };
}

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
    if (!ns.isBusy()) {
      const progResult = writeOrPurchaseProgram({
        ns,
        currentMoney: workingMoney,
        shouldBuy: false,
      });
      running = !progResult.noMoreActions;
    }

    await ns.sleep(60 * 1000);
  }
}
