/* A quick helper script to dump some information about the target script. May be helpful in
 * solution planning.
 */

import { displayHelp } from './libs/help';

const FLAGS_DEF = [
  ['help', false, 'Displays this help message'],
  ['server', '', 'The server to project run against'],
  [
    'projectServers',
    false,
    'Print details of running the script on various sized servers',
  ],
];
const getHelpAdditionalLines = (scriptName) => [
  `Usage: run ${scriptName}`,
  'Example:',
  `> run ${scriptName} fooScript.js`,
];

/**
 * @param {import(".").NS} ns Use just "@param {NS} ns" if editing in game
 */
export async function main(ns) {
  const args = ns.flags(FLAGS_DEF);
  const { help, server, projectServers } = args;
  if (help) {
    displayHelp({
      ns,
      description:
        'This script collects information about the supplied target script.',
      flagsDefinition: FLAGS_DEF,
      additionalLines: getHelpAdditionalLines(ns.getScriptName()),
    });
    return;
  }

  const targetScript = ns.args[0];
  const ram = ns.getScriptRam(targetScript);
  ns.tprint(`RAM: ${ram} GB`);

  if (server !== '') {
    // TODO: Expand to include XP, Income, etc. Will need expected args though.
    const exp = ns.getScriptExpGain(targetScript, 'home', args.server);
    const inc = ns.getScriptIncome(targetScript, 'home', args.server);
    ns.tprint(`Exp: ${exp}`);
    ns.tprint(`Inc: ${inc}`);
  }

  if (projectServers) {
    for (let i = 1; i <= 20; i++) {
      const size = Math.pow(2, i);
      const cost = ns.getPurchasedServerCost(size);
      const maxThreads = Math.floor(size / ram);

      ns.tprint(
        `${size}GB @ ${ns.nFormat(cost, '$0.0a')} - ${maxThreads} threads`,
      );
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
 * @param {array<string>} args current arguments minus "run script.js"
 * @returns {array<string>} The valid values for auto completion
 */
export function autocomplete(data, args) {
  if (args.length === 1) {
    return data.scripts;
  }

  switch (args[args.length - 2]) {
    case '--server':
      return data.servers;
    default:
      return [...data.scripts, ...data.servers];
  }
}
