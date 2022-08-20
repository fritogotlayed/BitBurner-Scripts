/* TODO: Coordinates various scriptable player actions.
 */

import { FILES_METADATA } from './libs/files';

const MONEY_PERCENTAGE = 0.5; // We gotta spend money to make money

const DEBUG = true;
/**
 * @param {import(".").NS} ns Use just "@param {NS} ns" if editing in game
 */
function log(ns, message) {
  if (DEBUG) {
    ns.print(message);
  }
}

/**
 * @param {object} args
 * @param {import(".").NS} args.ns Use just "@param {NS} ns" if editing in game
 */
function writeOrPurchaseProgram({ ns, currentMoney, shouldBuy, shouldFocus }) {
  let allExist = true;
  let workingMoney = currentMoney;
  try {
    // Process nuke tools first
    const orderedFiles = Object.values(FILES_METADATA).sort((a, b) =>
      a.isNukeTool === b.isNukeTool ? 0 : a.isNukeTool ? -1 : 1,
    );
    const hackingSkill = ns.getPlayer().skills.hacking;

    // log(ns, `writing or purchasing programs. Money: ${currentMoney}  HackingSkill: ${hackingSkill}`);

    for (const file of orderedFiles) {
      // log(ns, `processing file: ${file.name} - ${file.hackLevelReq}`);
      if (!ns.fileExists(file.name, 'home') && !ns.singularity.isBusy()) {
        allExist = false;
        // TODO: Consider writing program if proper sourcefile in place and player has "int" property
        if (shouldBuy) {
          if (file.cost <= workingMoney) {
            ns.singularity.purchaseProgram(file.name);
            workingMoney = workingMoney - file.cost;
          }
        } else {
          if (file.hackLevelReq <= hackingSkill) {
            ns.singularity.createProgram(file.name, shouldFocus);
            break;
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
  return { isBusy: ns.singularity.isBusy() };
}

/**
 * @param {object} args
 * @param {import(".").NS} args.ns Use just "@param {NS} ns" if editing in game
 */
function joinPendingFactions({ ns }) {
  const factions = ns.singularity.checkFactionInvitations();
  for (let i = 0; i < factions.length; i++) {
    const faction = factions[i];
    ns.singularity.joinFaction(faction);
  }
}

/**
 * @param {object} args
 * @param {import(".").NS} args.ns Use just "@param {NS} ns" if editing in game
 */
async function hasFocusPenaltyReductionImplant({ ns }) {
  const installedAugmentations = ns.singularity.getOwnedAugmentations(false);
  return installedAugmentations
    .filter((val) => val === 'Neuroreceptor Management Implant') // from Tian Di Hui (Neo Tokyo)
    .length > 0;
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
  let shouldFocus = !hasFocusPenaltyReductionImplant({ ns });
  log(ns, `Determined that player ${shouldFocus ? 'does not have' : 'has'} focus implant.`);
  // ns.singularity.purchaseTor(); // TODO: Figure out a way to tell if this is done already.
  const skipTerms = [
    'bypass',
    'skip',
    'none',
    'off',
  ];

  while (running) {
    workingMoney = ns.getPlayer().money * MONEY_PERCENTAGE;

    joinPendingFactions({ ns });

    let isBusy = ns.singularity.isBusy();
    if (!isBusy) {
      isBusy = writeOrPurchaseProgram({
        ns,
        currentMoney: workingMoney,
        shouldBuy: false,
        shouldFocus,
      }).isBusy;
    }

    if (!isBusy) {
      let crimeName = 'heist';
      if (ns.fileExists('preferred-crime.txt')) {
        const data = await ns.read('preferred-crime.txt');
        if (skipTerms.indexOf(`${data}`) === -1) {
          crimeName = null;
        } else {
          /*
          shoplift
          rob store
          mug
          larceny
          drugs
          bond forge
          traffic illegal arms
          homicide
          grand auto
          kidnap
          assassin
          heist
          */
          crimeName = `${data}`;
        }
      }

      if (crimeName) {
        const expectedTime = ns.singularity.commitCrime(crimeName);
        // commit crime is async. Wait a long time to give other actions a chance to "get through"
        await ns.sleep(expectedTime);
      }
    }

    await ns.sleep(60 * 1000);
  }
}
