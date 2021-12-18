/* This script is intended to take the first argument supplied and run a "hack"
 * loop against the target.
 */

/**
 * @param {import(".").NS} ns Use just "@param {NS} ns" if editing in game
 */
export async function main(ns) {
  const moneyPercentage = 0.05; // Only use a percent of the player capital so they can still work
  let running = true;
  const { hacknet } = ns;

  do {
    // TODO: Figure out start and after production
    let workingMoney = ns.getPlayer().money * moneyPercentage;
    let thisRunMoney = workingMoney;
    let nodeCount;
    let actionTaken;
    // let startProduction = 'UNKNOWN';
    // let afterProduction = 'UNKNOWN';
    do {
      actionTaken = false;
      nodeCount = hacknet.numNodes();

      if (workingMoney > hacknet.getPurchaseNodeCost()) {
        hacknet.purchaseNode();
        actionTaken = true;
        continue;
      }

      for (let i = 0; i < nodeCount; i++) {
        let levelCost = hacknet.getLevelUpgradeCost(i, 1);
        let memoryCost = hacknet.getRamUpgradeCost(i, 1);
        let coreCost = hacknet.getCoreUpgradeCost(i, 1);

        if (workingMoney > levelCost) {
          hacknet.upgradeLevel(i, 1);
          workingMoney = workingMoney - levelCost;
          actionTaken = true;
        }
        if (workingMoney > memoryCost) {
          hacknet.upgradeRam(i, 1);
          workingMoney = workingMoney - memoryCost;
          actionTaken = true;
        }
        if (workingMoney > coreCost) {
          hacknet.upgradeCore(i, 1);
          workingMoney = workingMoney - coreCost;
          actionTaken = true;
        }
      }
    } while (actionTaken);

    const outMsg = [];
    outMsg.push(`Start $: ${ns.nFormat(thisRunMoney, '0.0a')}`);
    outMsg.push(`Spent $: ${ns.nFormat(thisRunMoney - workingMoney, '0.0a')}`);
    // outMsg.push(`Before: ${startProduction}`);
    // outMsg.push(`After: ${afterProduction}`);

    ns.print(`${outMsg.join('\n')}`);

    await ns.sleep(60 * 1000); // Only update things once a minute.
  } while (running);
}
