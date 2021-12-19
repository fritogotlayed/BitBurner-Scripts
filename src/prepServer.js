/* This script is intended to take the first argument supplied and run a "hack"
 * loop against the target.
 */

/**
 * @param {import(".").NS} ns Use just "@param {NS} ns" if editing in game
 */
export async function main(ns) {
  try {
    const target = ns.args[0];
    const nextScript = ns.args[1];

    if (ns.fileExists('BruteSSH.exe', 'home')) {
      ns.brutessh(target);
    }
    if (ns.fileExists('FTPCrack.exe', 'home')) {
      ns.ftpcrack(target);
    }
    if (ns.fileExists('HTTPWorm.exe', 'home')) {
      ns.httpworm(target);
    }
    if (ns.fileExists('relaySMTP.exe', 'home')) {
      ns.relaysmtp(target);
    }
    if (ns.fileExists('SQLInject.exe', 'home')) {
      ns.sqlinject(target);
    }

    ns.nuke(target);

    if (nextScript) {
      await ns.scp('hackloop-remote.js', 'home', target);
      const ramReq = ns.getScriptRam(nextScript, target);
      const availableRam =
        ns.getServerMaxRam(target) - ns.getServerUsedRam(target);
      const threads = Math.floor(availableRam / ramReq);
      if (threads > 0) {
        ns.exec(nextScript, target, threads);
      }
    }
  } catch (err) {
    ns.alert(err);
  }
}
