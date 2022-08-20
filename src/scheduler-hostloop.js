/* This script will purchase servers that will run remote hacking against servers in the universe with money.
 * It is assumed that server will run a single threaded hackloop against each server that is available to be
 * hacked.
 */

/**
 * @param {import(".").NS} ns Use just "@param {NS} ns" if editing in game
 */
export async function main(ns) {
  // TODO: show error return if not run from 'home'

  // how much money do we have to play with?
  const moneyPercentage = 0.05; // use 5% of current money (when rich, upwards of 25% can be used)

  const schedulerScript = 'scheduler-hackloop.js';
  const hackScript = 'hackloop.js';
  const currentHost = ns.getHostname();

  let running = true;
  do {
    const thisRunMoney = ns.getPlayer().money * moneyPercentage;
    let workingMoney = thisRunMoney;

    let schedulerRamCost = ns.getScriptRam(schedulerScript);
    let hackScriptRamCost = ns.getScriptRam(hackScript);

    const maxServersOwnable = ns.getPurchasedServerLimit();
    const purchasedServers = ns.getPurchasedServers();

    if (purchasedServers.length === maxServersOwnable) {
      // TODO: write and call server upgrade script
      break;
    }

    if (!ns.fileExists('netmap-data.json', currentHost)) {
      ns.exec('netmap.js', currentHost, 1);
      let netmapRunning = true;
      do {
        await ns.sleep(1000);
        netmapRunning = !ns.fileExists('netmap-data.json', currentHost);
      } while (netmapRunning);
    }

    const serversMeta = JSON.parse(ns.read('netmap-data.json'));
    // we don't run hackloop.js against faction servers
    const servers = Object.keys(serversMeta).filter((e) => !e.factionServer);
    let totalTargetCount = servers.length;

    // find the most expensive server we can with money available
    const maxServerSize = ns.getPurchasedServerMaxRam();
    let maxServerAffordable = 0;
    let maxServerAffordableCost = 0;
    for (
      let i = 2;
      i < maxServerSize && maxServerAffordableCost < workingMoney;
      i *= 2
    ) {
      maxServerAffordableCost = ns.getPurchasedServerCost(i);
      maxServerAffordable = i;
    }

    const outMsg = [];
    const minRequiredRam =
      totalTargetCount * hackScriptRamCost + schedulerRamCost;
    if (minRequiredRam < maxServerAffordable) {
      // buy the largest affordable
      var serverName = ns.purchaseServer('hackloophost', maxServerAffordable);

      // determine how many threads we can run on affordable
      let availableRam = maxServerAffordable - schedulerRamCost;
      let hackScriptRam = totalTargetCount * hackScriptRamCost;
      let threads = Math.floor(availableRam / hackScriptRam);

      if (threads > 0) {
        // copy scripts from 'home' to new serverName
        await ns.scp(schedulerScript, serverName, 'home');
        await ns.scp(hackScript, serverName, 'home');
        await ns.scp('netmap.js', serverName, 'home');

        // execute the scheduler to spawn hackloops
        let pid = ns.exec(
          schedulerScript,
          serverName,
          1,
          '--runType',
          'local',
          '--threads',
          threads,
        );

        if (pid <= 0) {
          outMsg.push(
            `FAILED to exec ${schedulerScript} on host ${serverName}`,
          );
        }
      }
    } else {
      // this server can't run the bare minimum, skip this round
      outMsg.push(`Could not afford server with enought RAM`);
      outMsg.push(`Largest Affordable: ${maxServerAffordableCost}`);
      outMsg.push(`Min RAM Cost:       ${minRequiredRam}`);
    }

    outMsg.push(`Start $: ${ns.nFormat(workingMoney, '0.0a')}`);
    // outMsg.push(`Spent $: ${ns.nFormat(thisRunMoney - workingMoney, '0.0a')}`);

    ns.print(`${outMsg.join('\n')}`);

    //check every 5 minutes to let money build up
    await ns.sleep(5 * 60 * 1000);
  } while (running);
}
