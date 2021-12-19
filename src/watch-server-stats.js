/* TODO: Update what this scripts intention is
 */

/**
 * @param {import(".").NS} ns Use just "@param {NS} ns" if editing in game
 */
const displayHelp = (ns) => {
  ns.tprint('Visualize the money and security of a server.');
  ns.tprint(`USAGE: run ${ns.getScriptName()} SERVER_NAME`);
  ns.tprint('Example:');
  ns.tprint(`> run ${ns.getScriptName()} hong-fang-tea`);
};

/**
 * @param {import(".").NS} ns Use just "@param {NS} ns" if editing in game
 * @param {number} current
 * @param {number} maximum
 */
const displayMoney = (ns, current, maximum) => {
  const moneyFmt = ns.nFormat(current, '$0.000a');
  const maxMoneyFmt = ns.nFormat(maximum, '$0.000a');
  const percentFmt = ((current / maximum) * 100).toFixed(2);

  return `${moneyFmt} / ${maxMoneyFmt} (${percentFmt}%)`;
};

/**
 * @param {number} current
 * @param {number} maximum
 */
const displaySecurity = (current, minimum) => {
  return `+${(current - minimum).toFixed(2)}`;
};

/**
 * @param {import(".").NS} ns Use just "@param {NS} ns" if editing in game
 */
export async function main(ns) {
  const flags = ns.flags([
    ['refreshrate', 200],
    ['help', false],
  ]);

  if (flags._.length === 0 || flags.help) {
    displayHelp(ns);
    return;
  }

  ns.tail();
  ns.disableLog('ALL');

  while (true) {
    const server = flags._[0]; // functionally same as ns.args but smarter

    const money = ns.getServerMoneyAvailable(server);
    const maxMoney = ns.getServerMaxMoney(server);
    const minSec = ns.getServerMinSecurityLevel(server);
    const sec = ns.getServerSecurityLevel(server);

    ns.clearLog(server);
    ns.print(`${server}:`);
    if (money > 0) {
      ns.print(` Money   : ${displayMoney(ns, money, maxMoney)}`);
    } else {
      ns.print(` Money   : !! NO MONEY ON SERVER !!`);
    }
    ns.print(` Security: ${displaySecurity(sec, minSec)}`);
    ns.print(` Hack    : ${ns.tFormat(ns.getHackTime(server))}`);
    ns.print(` Grow    : ${ns.tFormat(ns.getGrowTime(server))}`);
    ns.print(` Weaken  : ${ns.tFormat(ns.getWeakenTime(server))}`);

    await ns.sleep(flags.refreshrate);
  }
}

export function autocomplete(data, args) {
  // https://bitburner.readthedocs.io/en/latest/netscript/advancedfunctions/autocomplete.html
  return data.servers;
}
