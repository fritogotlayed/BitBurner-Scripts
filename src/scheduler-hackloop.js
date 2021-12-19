const hackTools = [
  'BruteSSH.exe',
  'FTPCrack.exe',
  'HTTPWorm.exe',
  'relaySMTP.exe',
  'SQLInject.exe',
];

/**
 * @param {import(".").NS} ns Use just "@param {NS} ns" if editing in game
 */
export async function main(ns) {
  /* TODO
   * Check available memory and purchase "home" memory in loop
   * CSEC doesn't have money. No real reason to continue the script once hacked first time
   */
  const hackScript = 'hackloop-remote.js';
  const homeHost = 'home';
  const sleepTime = 1000 * 60; // milliseconds
  let running = true;

  if (!ns.fileExists('netmap-data.json', 'home')) {
    ns.exec('netmap.js', 'home', 1);
    let netmapRunning = true;
    do {
      await ns.sleep(1000);
      netmapRunning = !ns.fileExists('netmap-data.json', 'home');
    } while (netmapRunning)
  }

  const serversMeta = JSON.parse(ns.read('netmap-data.json'));
  const servers = Object.keys(serversMeta);

  do {
    const hackingSkill = ns.getPlayer().hacking;
    let hackToolCount = 0;
    for (let i = 0; i < hackTools.length; i += 1) {
      if (ns.fileExists(hackTools[i], homeHost)) {
        hackToolCount += 1;
      }
    }
    ns.print(`hackingSkill: ${hackingSkill}`);
    ns.print(`hackToolCount: ${hackToolCount}`);
    ns.print(`scanning ${servers.length} servers.`);

    for (let i = 0; i < servers.length; i += 1) {
      let target = servers[i];
      let meta = serversMeta[target];
      if (!meta) {
        ns.print(`WARNING: Could not find metadata for server: ${target}`);
      } else {
        // Check if a script is running
        const isRunning = ns.isRunning(hackScript, target);

        // Check if the server is hacked and we could hack it
        const hackSkillMet = hackingSkill >= meta.reqHackSkill;
        const toolCountMet = hackToolCount >= meta.reqNukePorts;
        const alreadyHacked = ns.hasRootAccess(target);
        const shouldRun =
          hackSkillMet &&
          toolCountMet &&
          !isRunning &&
          (meta.restartHack || !alreadyHacked);

        if (shouldRun) {
          ns.print(`Starting hack on ${target}`);
          // ns.exec(meta.runScript || 'hackloop.js', 'home', 1, target);
          const remotePid = ns.exec(
            'prepServer.js',
            'home',
            1,
            target,
            'hackloop-remote.js',
          );
          ns.print(`Spawning on remote ${target} pid ${remotePid}`);
          await ns.sleep(1000);
        }
      }
    }

    await ns.sleep(sleepTime);
  } while (running);
}
