/* Script that creates a JSON file of the players source files. Offloading this to a different
 * file allows memory consumption to stay low during the bootstrapping process when the player
 * first enters a bitnode.
 */

import { displayHelp } from './libs/help';

const OUT_FILE = 'source-file-data.json';

const FLAGS_DEF = [['help', false, 'Displays this help message']];
const getHelpAdditionalLines = (scriptName) => [
  `Usage: run ${scriptName}`,
  'Example:',
  `> run ${scriptName}`,
];

/**
 * @param {import(".").NS} ns Use just "@param {NS} ns" if editing in game
 */
export async function main(ns) {
  const args = ns.flags(FLAGS_DEF);
  if (args.help) {
    const scriptName = ns.getScriptName();
    return displayHelp({
      ns,
      description:
        'This script collects information about the players source files.',
      flagsDefinition: FLAGS_DEF,
      additionalLines: getHelpAdditionalLines(scriptName),
    });
  }

  const data = ns.singularity.getOwnedSourceFiles().map((e) => ({
    id: e.n,
    level: e.lvl,
  }));
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
