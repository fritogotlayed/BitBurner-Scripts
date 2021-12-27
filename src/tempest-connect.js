/* shamelessly stolen from u/Tempest_42
 * https://www.reddit.com/r/Bitburner/comments/rhpp8p/scan_script_updated_for_bitburner_v110/
 */
/**
 * @param {import(".").NS} ns Use just "@param {NS} ns" if editing in game
 */
export async function main(ns) {
  let target = ns.args[0];
  let paths = { home: '' };
  let queue = Object.keys(paths);
  let name;
  let output;
  let pathToTarget;
  while ((name = queue.shift())) {
    let path = paths[name];
    let scanRes = ns.scan(name);
    for (let newSv of scanRes) {
      if (paths[newSv] === undefined) {
        queue.push(newSv);
        paths[newSv] = `${path},${newSv}`;
        if (newSv == target) pathToTarget = paths[newSv].substr(1).split(',');
      }
    }
  }
  output = 'home; ';

  pathToTarget.forEach((server) => (output += ' connect ' + server + ';'));

  const terminalInput = document.getElementById('terminal-input');
  terminalInput.value = output;
  const handler = Object.keys(terminalInput)[1];
  terminalInput[handler].onChange({ target: terminalInput });
  terminalInput[handler].onKeyDown({ keyCode: 13, preventDefault: () => null });
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
  return data.servers;
}
