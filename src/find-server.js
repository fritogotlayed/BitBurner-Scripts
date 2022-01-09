/* This script is useful for finding a series of servers through which to connect to your intended server
 */

import { displayHelp } from './libs/help.js';

/**
 * @param {import(".").NS} ns Use just "@param {NS} ns" if editing in game
 * @param {string} parent
 * @param {string} server
 * @param {string} target
 * @param {array} route
 * @returns {boolean}
 */
function recursiveScan(ns, parent, server, target, route) {
  // Get the children of the machine we're on
  const children = ns.scan(server);

  for (let i = 0; i < children.length; i += 1) {
    const child = children[i];

    // Don't go "backwards"
    if (parent === child) {
      continue;
    }

    // If we found our target
    if (child === target) {
      route.unshift(child);
      route.unshift(server);
      return true;
    }

    // Keep on looking...
    if (recursiveScan(ns, server, child, target, route)) {
      route.unshift(server);
      return true;
    }
  }

  return false;
}

/**
 * @param {import(".").NS} ns Use just "@param {NS} ns" if editing in game
 */
export async function main(ns) {
  const args = ns.flags([['help', false]]);
  let route = [];
  let target = args._[0];

  if (!target || args.help) {
    const scriptName = ns.getScriptName();
    displayHelp({
      ns,
      description:
        'This script helps you find a server on the network and shows you the path to get to it.',
      additionalLines: [
        `Usage: run ${scriptName} SERVER`,
        'Example:',
        `> run ${scriptName} n00dles`,
      ],
    });

    return;
  }

  recursiveScan(ns, '', 'home', target, route);
  for (const i in route) {
    const extra = i > 0 ? 'ட ' : '';
    ns.tprint(`${'  '.repeat(i)}${extra}${route[i]}`);
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
