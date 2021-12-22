/* This script is intended to take the first argument supplied and run a "hack"
 * loop against the target.
 */

import { displayHelp } from './libs/common.js';

const FLAGS_DEF = [
  ['bypassHack', false, 'True to exit the script instead of hack'],
  ['help', false, 'Displays this help message'],
];

/**
 * @param {import(".").NS} ns Use just "@param {NS} ns" if editing in game
 */
export async function main(ns) {
  const target = ns.args[0] || ns.getHostname();
  const flags = ns.flags(FLAGS_DEF);

  if (flags.help) {
    displayHelp({
      ns,
      flagsDefinition: FLAGS_DEF,
      description:
        'This script performs a basic hack loop against the target server',
      additionalLines: [
        `Usage: run ${ns.getScriptName()} SERVER`,
        'Example:',
        `> run ${ns.getScriptName()} max-hardware`,
      ],
    });
    return;
  }

  // Compute the target security level and lowest money threshold we
  // should act against. Given that hacking extracts a percentage of
  // the available money we want to keep the total "bank" of the
  // target server relatively high.
  const moneyFormat = '$0,0.00a'; // http://numeraljs.com
  const moneyThresh = ns.getServerMaxMoney(target) * 0.75;
  const securityThresh = ns.getServerMinSecurityLevel(target) + 5;

  if (ns.fileExists('BruteSSH.exe', 'home')) {
    ns.brutessh(target);
  }
  if (ns.fileExists('FTPCrack.exe', 'home')) {
    ns.ftpcrack(target);
  }
  if (ns.fileExists('HTTPWorm.exe', 'home')) {
    ns.httpworm(target);
  }
  if (ns.fileExists('relaySMTP.exe', 'home')) {
    ns.relaysmtp(target);
  }
  if (ns.fileExists('SQLInject.exe', 'home')) {
    ns.sqlinject(target);
  }
  ns.nuke(target);

  while (true) {
    const currentSecurity = ns.getServerSecurityLevel(target);
    const currentMoney = ns.getServerMoneyAvailable(target);
    ns.print(`MoneyThresh   : ${ns.nFormat(moneyThresh, moneyFormat)}
MoneyAvailable: ${ns.nFormat(currentMoney, moneyFormat)}
SecurityThresh: ${securityThresh}
SecurityLevel : ${currentSecurity}`);
    if (currentSecurity > securityThresh) {
      await ns.weaken(target);
    } else if (currentMoney < moneyThresh) {
      await ns.grow(target);
    } else {
      if (flags.bypassHack) {
        ns.toast(
          `Exiting hackloop on ${target} from ${ns.getHostname()}`,
          'info',
        );
        return;
      }
      await ns.hack(target);
    }
  }
}

/**
 * @typedef {object} AutocompleteData https://bitburner.readthedocs.io/en/latest/netscript/advancedfunctions/autocomplete.html
 * @property {array<string>} servers List of all servers in the game
 * @property {array<string>} txts List of all text files on the current computer
 * @property {array<string>} scripts List of all scripts on the current computer
 * @property {Function} flags See the ns.flags function for more information on usage
 */

/**
 * Handler for autocomplete functionality
 * @param {AutocompleteData} data General data about the game you may want to autocomplete.
 * @param {array<string>} args current arguments minux "run script.js"
 * @returns {array<string>} The valid values for auto completion
 */
export function autocomplete(data, args) {
  return data.servers;
}
