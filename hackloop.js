/* This script is intended to take the first argument supplied and run a "hack"
 * loop against the target.
 */

/**
 * @param {import(".").NS} ns Use just "@param {NS} ns" if editing in game
 */
export async function main(ns) {
    /* TODO
     * Check available memory and purchase "home" memory in loop
     */
    const target = ns.args[0];

    // Compute the target security level and lowest money threshold we
    // should act against. Given that hacking extracts a percentage of
    // the available money we want to keep the total "bank" of the
    // target server relatively high.
    const moneyThresh = ns.getServerMaxMoney(target) * 0.75;
    const securityThresh = ns.getServerMinSecurityLevel(target) + 5;
    ns.print(`MoneyThresh: ${moneyThresh}\nSecurityThresh: ${securityThresh}`);

    if (ns.fileExists("BruteSSH.exe", "home")) { ns.brutessh(target); }
    if (ns.fileExists("FTPCrack.exe", "home")) { ns.ftpcrack(target); }
    if (ns.fileExists("HTTPWorm.exe", "home")) { ns.httpworm(target); }
    if (ns.fileExists("relaySMTP.exe", "home")) { ns.relaysmtp(target); }
    if (ns.fileExists("SQLInject.exe", "home")) { ns.sqlinject(target); }
    ns.nuke(target);

    while(true) {
        if (ns.getServerSecurityLevel(target) > securityThresh) {
            await ns.weaken(target);
        } else if (ns.getServerMoneyAvailable(target) < moneyThresh) {
            await ns.grow(target);
        } else {
            await ns.hack(target);
        }
    }
}