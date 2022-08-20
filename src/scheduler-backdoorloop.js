/* TODO: Update what this scripts intention is
 */

import { recursiveScan } from './libs/scan';

const BACKDOOR_SIGNAL = 'backdoor-installed.txt';

/**
 * @param {import(".").NS} ns Use just "@param {NS} ns" if editing in game
 * @param {string} currentHost The host this script is running on
 */
async function getServersMeta(ns, currentHost) {
  if (!ns.fileExists('netmap-data.json', currentHost)) {
    ns.exec('netmap.js', currentHost, 1);
    let netmapRunning = true;
    do {
      await ns.sleep(1000);
      netmapRunning = !ns.fileExists('netmap-data.json', currentHost);
    } while (netmapRunning);
  }

  return JSON.parse(ns.read('netmap-data.json'));
}

/**
 * @param {import(".").NS} ns Use just "@param {NS} ns" if editing in game
 */
export async function main(ns) {
  ns.disableLog('sleep');

  const currentHost = ns.getHostname();
  const serversMeta = await getServersMeta(ns, currentHost);
  const servers = Object.keys(serversMeta);

  let running = true;
  do {
    for (let i = 0; i < servers.length; i += 1) {
      let target = servers[i];
      let meta = serversMeta[target];
      let route = [];

      if (meta && meta.factionServer) {
        if (
          ns.hasRootAccess(target) &&
          !ns.fileExists(BACKDOOR_SIGNAL, target)
        ) {
          recursiveScan(ns, '', 'home', target, route);
          for (let j = 0; j < route.length; j++) {
            ns.singularity.connect(route[j]);
          }

          await ns.write(BACKDOOR_SIGNAL, '', 'w');
          await ns.singularity.installBackdoor();
          route.reverse();
          for (let j = 0; j < route.length; j++) {
            ns.singularity.connect(route[j]);
          }
        }
      }
    }
    await ns.sleep(1000 * 60);
  } while (running);
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
 * @param {array<string>} args current arguments minus "run script.js"
 * @returns {array<string>} The valid values for auto completion
 */
export function autocomplete(data, args) {
  return [];
}
