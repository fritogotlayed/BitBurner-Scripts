/* This script is useful for finding a series of servers through which to connect to your intended server
 */

import { displayHelp } from './libs/help.js';
import { recursiveScan } from './libs/scan.js';

const FLAGS_DEF = [
  ['help', false, 'Displays this help message'],
  [
    'displayType',
    'tree',
    '"tree" or "commands". Configures how results are displayed',
  ],
];

/**
 * @param {import(".").NS} ns Use just "@param {NS} ns" if editing in game
 */
export async function main(ns) {
  const args = ns.flags(FLAGS_DEF);
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

  switch (args.displayType) {
    case 'commands':
      ns.tprint(
        route.map((r) => (r === 'home' ? '' : `connect ${r};`)).join(' '),
      );
      break;
    default:
      for (const i in route) {
        const extra = i > 0 ? 'ட ' : '';
        ns.tprint(`${'  '.repeat(i)}${extra}${route[i]}`);
      }
      break;
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
