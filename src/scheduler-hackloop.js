const hackTools = [
  'BruteSSH.exe',
  'FTPCrack.exe',
  'HTTPWorm.exe',
  'relaySMTP.exe',
  'SQLInject.exe',
];

const factionServers = [
  "CSEC",
  "avmnite-01h",
  "I.I.I.I",
  "run3theh111z",
  "The-Cave",
  "w-1r1d_d43m0n",
  "darkweb",
];

/**
 * @param {import(".").NS} ns Use just "@param {NS} ns" if editing in game
 */
export async function main(ns) {
  /* TODO
   * Check available memory and purchase "home" memory in loop
   * CSEC doesn't have money. No real reason to continue the script once hacked first time
   */
  ns.disableLog('sleep');
  const args = ns.flags([['help', false]]);
  let runType = args._[0];

  let shouldShowHelp = !runType ||
    !['local', 'remote', 'both'].includes(runType) ||
    args.help;

  if (shouldShowHelp) {
    ns.tprint('This script auto-hacks all servers based on hack skill and available cracking tools.');
    ns.tprint(`Usage: run ${ns.getScriptName()} RUNTYPE`);
    ns.tprint('Where RUNTYPE is one of: local remote both.')
    ns.tprint('NOTE: When running remotely, it will use the max number');
    ns.tprint('of threads to use as much of the targets RAM as possible.')
    ns.tprint('');
    ns.tprint('WARN: Running locally will (eventually) use a lot of RAM on the host.')
    ns.tprint('Example:');
    ns.tprint(`> run ${ns.getScriptName()} remote`);
    ns.tprint(`> run ${ns.getScriptName()} local`);
    ns.tprint(`> run ${ns.getScriptName()} both`);
    return;
  }

  const hackScriptLocal = 'hackloop.js';
  const hackScriptRemote = 'hackloop-remote.js';
  const crackScript = 'prepServer.js';

  const homeHost = 'home';
  const currentHost = ns.getHostname();

  const sleepTime = 1000 * 60; // milliseconds
  let running = true;

  if (!ns.fileExists('netmap-data.json', currentHost)) {
    ns.exec('netmap.js', currentHost, 1);
    let netmapRunning = true;
    do {
      await ns.sleep(1000);
      netmapRunning = !ns.fileExists('netmap-data.json', currentHost);
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
        // add faction script to meta for faction servers
        if (factionServers.includes(target)) {
          meta.runScript = 'backdoor.js';
        }
        // Check if a script is running
        const isRunningLocal = ns.isRunning(hackScriptLocal, currentHost, target); // run hackloop.js target
        const isRunningRemote = ns.isRunning(hackScriptRemote, target); // remote exec, see below

        // Check if the server is hacked and we could hack it
        const hackSkillMet = hackingSkill >= meta.reqHackSkill;
        const toolCountMet = hackToolCount >= meta.reqNukePorts;
        const alreadyHacked = ns.hasRootAccess(target);

        const shouldRun =
          hackSkillMet &&
          toolCountMet &&
          (meta.restartHack || !alreadyHacked);
        const shouldRunLocal =
          shouldRun &&
          !isRunningLocal &&
          (runType === 'local' || runType === 'both');
        const shouldRunRemote =
          shouldRun &&
          !isRunningRemote &&
          (runType === 'remote' || runType === 'both');

        if (shouldRunLocal) {
          ns.toast(`Starting hack locally against ${target}`);
          ns.print(`Starting hack locally against ${target}`);
          ns.exec(meta.runScript || hackScriptLocal, currentHost, 1, target);
        }
        if (shouldRunRemote) {
          ns.toast(`Starting hack remotely on ${target}`);
          const remotePid = ns.exec(
            crackScript,
            currentHost,
            1,
            target,
            hackScriptRemote,
          );
          if (remotePid === 0) {
            ns.toast(`FAILED to run crackScript ${crackScript} on remote ${target}`);
            ns.print(`FAILED to run crackScript ${crackScript} on remote ${target}`);
          } else {
            ns.toast(`Spawning on remote ${target} pid ${remotePid}`);
            ns.print(`Spawning on remote ${target} pid ${remotePid}`);
          }
        }
        await ns.sleep(500); // sleep 0.5 second to give time for next server on this pass
      }
    }

    await ns.sleep(sleepTime);
    ns.print(`Snoozing for ${sleepTime/1000} seconds.`)
  } while (running);
}
