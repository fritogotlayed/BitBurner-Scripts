/**
 * @param {import(".").NS} ns Use just "@param {NS} ns" if editing in game
 */
export async function main(ns) {
  const target = ns.args[0];

  const moneyFormat = '$0,0.00a'; // http://numeraljs.com
  const moneyThresh = ns.getServerMaxMoney(target) * 0.75;
  const securityThresh = ns.getServerMinSecurityLevel(target) + 5;

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
      await ns.sleep(1000);
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
  return data.servers;
}
