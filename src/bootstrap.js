/* Quick entry point for getting the users system up and running after installing augments
*/

import { displayHelp } from './libs/help';

const FLAGS_DEF = [
  ['help', false, 'Displays this help message'],
  ['bitnode', 0, 'The bitnode you are currently in'],
];

/**
 * @param {import(".").NS} ns Use just "@param {NS} ns" if editing in game
 */
export async function main(ns) {

  const args = ns.flags(FLAGS_DEF);
  const { help, bitnode } = args; // bitnode is a future expansion point

  if (help) {
    const scriptName = ns.getScriptName();
    displayHelp({
      ns,
      description: 'This script provides a quick entry point for post-aug install setup.',
      flagsDefinition: FLAGS_DEF,
      additionalLines: [
        'Example:',
        `> run ${scriptName}`,
        `> run ${scriptName} --node 1`,
      ],
    });
    return;
  }

  ns.exec('netmap.js', 'home', 1);
  await ns.sleep(1000);

  ns.exec('scheduler-hacknet.js', 'home', 1);
  ns.exec('scheduler-hackloop.js', 'home', 1, '--runType', 'both');
  ns.exec('scheduler-hostloop.js', 'home', 1);
  ns.exec('scheduler-playerActions.js', 'home', 1);
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
