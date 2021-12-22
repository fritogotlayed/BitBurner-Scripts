/* TODO: Update what this scripts intention is
 */

import { displayHelp } from './libs/common';

const OUT_FILE = 'netmap-data.json';
const FLAGS_DEF = [['help', false, 'Displays this help message']];

/**
 * @param {import(".").NS} ns Use just "@param {NS} ns" if editing in game
 * @param {object} data The object used to track data across recursive calls
 * @param {string} node The name of the current node we are working from
 */
function hydrateServers(ns, data, node) {
  const children = ns.scan(node);
  const purchasedServers = ns.getPurchasedServers();
  children.forEach((server) => {
    const isNetTarget =
      data[server] === undefined &&
      server !== 'home' && // ignore our starter computer
      !purchasedServers.includes(server); // ignore all purchased servers
    if (isNetTarget) {
      data[server] = {
        reqHackSkill: ns.getServerRequiredHackingLevel(server),
        reqNukePorts: ns.getServerNumPortsRequired(server),
        restartHack: !!ns.getServerMoneyAvailable(server),
        totalMem: ns.getServerMaxRam(server),
        hasMoney: !!ns.getServerMoneyAvailable(server),
      };
      hydrateServers(ns, data, server);
    }
  });
}

/**
 * @param {import(".").NS} ns Use just "@param {NS} ns" if editing in game
 */
export async function main(ns) {
  const args = ns.flags(FLAGS_DEF);
  if (args.help) {
    displayHelp({
      ns,
      description:
        'This script collects information about the currently viewable network.',
      flagsDefinition: FLAGS_DEF,
      additionalLines: [
        `Usage: run ${ns.getScriptName()}`,
        'Example:',
        `> run ${ns.getScriptName()}`,
      ],
    });
    return;
  }

  const data = {};
  hydrateServers(ns, data, 'home');
  await ns.write(OUT_FILE, JSON.stringify(data), 'w');
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
  return [];
}
