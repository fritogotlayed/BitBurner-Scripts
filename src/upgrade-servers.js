/* TODO: Update what this scripts intention is
 */

/**
 * @param {import(".").NS} ns Use just "@param {NS} ns" if editing in game
 */
export async function main(ns) {
  const purchasedServers = ns.getPurchasedServers();
  // TODO: make workingMoney smarter
  const workingMoney = ns.getPlayer().money * 0.1; // start with 10% of total cash

  // TODO: copy/paste from scheduler-hostloop.js, make a script
  // find the most expensive server we can with money available
  const maxServerSize = ns.getPurchasedServerMaxRam();
  let maxServerAffordable = 0;
  let maxServerAffordableCost = 0;
  for (let i = 2; i < maxServerSize && maxServerAffordableCost < workingMoney; i *= 2 ) {
    maxServerAffordableCost = ns.getPurchasedServerCost(i);
    maxServerAffordable = i;
  }

  // iterate servers, see if you can afford an upgrade, upgrade it
  for (let i = 0; i < purchasedServers.length && workingMoney >= maxServerAffordableCost; i++) {
    const currentServer = purchasedServers[i];
    const currentSize = ns.getServerMaxRam(currentServer);
    //TODO: handle negative case (log failure)
    if (workingMoney >= maxServerAffordableCost && currentSize < maxServerAffordable) {
      ns.print(`Upgrading ${currentServer} from ${currentSize}Gb to ${maxServerAffordable}Gb`)
      ns.killall(currentServer);
      ns.deleteServer(currentServer);
      ns.purchaseServer(currentServer, maxServerAffordable);
      workingMoney = workingMoney - maxServerAffordableCost;
      // TODO: extract scp and exec from scheduler-hostloop.js into script
      // TODO: call that script here
    }
  }


  // let maxServers = ns.getPurchasedServerLimit();
  // let maxSize = ns.getPurchasedServerMaxRam();
  // let money = ns.getPlayer().money;

  // let currentSize = 0;
  // if (ns.serverExists("hackloophost")) {
  //   currentSize = ns.getServerMaxRam("hackloophost");
  // }

  // let ram = 1;

  // while (ram * 2 <= maxSize && ns.getPurchasedServerCost(ram * 2) < money / maxServers) {
  //   ram *= 2;
  // }

  // if (ram < 2 || ram <= currentSize) {
  //   ns.print("Can't afford upgrade - current " + currentSize + "GB, can afford " + ram + "GB");
  //   ns.exit();
  // }

  // ns.print("Buying " + maxServers + " " + ram + "GB servers")
  // for (let i = 0; i < maxServers; i++) {
  //   if (ns.serverExists("pserv-" + i)) {
  //     ns.killall("pserv-" + i);
  //     ns.deleteServer("pserv-" + i);
  //   }
  //   ns.purchaseServer("pserv-" + i, ram);
  // }
}
