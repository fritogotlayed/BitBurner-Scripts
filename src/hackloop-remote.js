/* This script is intended to take the first argument supplied and run a "hack"
 * loop against the target.
 */

/**
 * @param {import(".").NS} ns Use just "@param {NS} ns" if editing in game
 */
export async function main(ns) {
  try {
    const target = ns.args[0] || ns.getHostname();

    // Compute the target security level and lowest money threshold we
    // should act against. Given that hacking extracts a percentage of
    // the available money we want to keep the total "bank" of the
    // target server relatively high.
    const moneyFormat = '$0,0.00a'; // http://numeraljs.com
    const moneyThresh = ns.getServerMaxMoney(target) * 0.75;
    const securityThresh = ns.getServerMinSecurityLevel(target) + 5;

    let running = true;

    while (running) {
      const currentSecurity = ns.getServerSecurityLevel(target);
      const currentMoney = ns.getServerMoneyAvailable(target);
      if (currentMoney === 0) {
        running = false;
      }
      ns.print(`MoneyThresh   : ${ns.nFormat(moneyThresh, moneyFormat)}
MoneyAvailable: ${ns.nFormat(currentMoney, moneyFormat)}
SecurityThresh: ${securityThresh}
SecurityLevel : ${currentSecurity}`);
      if (currentSecurity > securityThresh) {
        await ns.weaken(target);
      } else if (currentMoney < moneyThresh) {
        await ns.grow(target);
      } else {
        await ns.hack(target);
      }

      await ns.sleep(500);
    }
  } catch (err) {
    ns.write('error-log.txt', err, 'w');
  }
}
