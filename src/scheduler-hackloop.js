const SLEEP_TIME = 1000 * 60; // milliseconds
const hackScriptLocal = 'hackloop.js';
const hackScriptRemote = 'hackloop-remote.js';
const crackScript = 'prepServer.js';
const homeHost = 'home';

import { displayHelp } from './libs/help';
import { FILES_METADATA } from './libs/files';

const FLAGS_DEF = [
  ['help', false, 'Displays this help message'],
  [
    'runType',
    '',
    '"local", "remote" or "both". Controls where hacks are started.',
  ],
  ['threads', 1, ''],
];

const hackTools = Object.values(FILES_METADATA)
  .filter((meta) => meta.isNukeTool)
  .map((elem) => elem.name);

/**
 * @param {import(".").NS} ns Use just "@param {NS} ns" if editing in game
 * @param {string} currentHost The host this script is running on
 */
async function getServersMeta(ns, currentHost) {
  if (!ns.fileExists('netmap-data.json', currentHost)) {
    ns.exec('netmap.js', currentHost, 1);
    let netmapRunning = true;
    do {
      await ns.sleep(1000);
      netmapRunning = !ns.fileExists('netmap-data.json', currentHost);
    } while (netmapRunning);
  }

  return metadata;
}

/**
 * @param {object} args
 * @param {import(".").NS} args.ns Use just "@param {NS} ns" if editing in game
 * @param {string} args.currentHost
 * @param {string} args.target
 * @param {array} args.serversMeta
 */
function collectStatsAgainstTarget({
  ns,
  currentHost,
  target,
  serversMeta,
  hackingSkill,
  hackToolCount,
}) {
  const meta = serversMeta[target];

  // Check if a script is running
  const isRunningLocal = ns.isRunning(hackScriptLocal, currentHost, target);
  const isRunningRemote = ns.isRunning(hackScriptRemote, target); // remote exec, see below

  // Check if the server is hacked and we could hack it
  const hackSkillMet = hackingSkill >= meta.reqHackSkill;
  const toolCountMet = hackToolCount >= meta.reqNukePorts;
  const alreadyHacked = ns.hasRootAccess(target);

  return {
    isRunningLocal,
    isRunningRemote,
    hackSkillMet,
    toolCountMet,
    alreadyHacked,
  };
}

/**
 *
 * @param {object} args
 * @param {import(".").NS} args.ns Use just "@param {NS} ns" if editing in game
 * @param {string} args.host The host that will execute this script
 * @param {string} args.script The script to run.
 * @param {boolean} args.isRemote Toggle to help format output messages
 * @param {string} args.target The first arg of the script. Used as "target" in output messages
 * @param {array<string | number | boolean>} args.args A list of additional arguments to be passed to the executed script
 */
const startHackWithLogging = ({
  ns,
  host,
  script,
  isRemote,
  target,
  threads,
  args,
  verboseLogging = false,
}) => {
  const msgPlug = isRemote ? 'remotely on' : 'locally against';
  if (verboseLogging) {
    ns.toast(`Starting hack ${msgPlug} ${target}`);
  }
  ns.print(`Starting hack ${msgPlug} ${target}`);

  const pid = ns.exec(script, host, threads, target, ...args);

  if (pid === 0) {
    ns.toast(`FAILED to run ${script} ${msgPlug} ${target}`, 'error');
    ns.print(`FAILED to run ${script} ${msgPlug} ${target}`);
  } else {
    if (verboseLogging) {
      ns.toast(`Started ${script} ${msgPlug} ${target}. PID: ${pid}`);
    }
    ns.print(`Started ${script} ${msgPlug} ${target}. PID: ${pid}`);
  }
};

/**
 * @param {import(".").NS} ns Use just "@param {NS} ns" if editing in game
 */
export async function main(ns) {
  /* TODO
   * Check available memory and purchase "home" memory in loop
   * Some faction servers do not have money. No real reason to continue the script once hacked first time
   */
  ns.disableLog('sleep');
  ns.disableLog('getServerMoneyAvailable');
  ns.disableLog('getServerMaxRam');

  const args = ns.flags(FLAGS_DEF);
  const { runType, threads } = args;

  const shouldShowHelp =
    !runType || !['local', 'remote', 'both'].includes(runType) || args.help;

  if (shouldShowHelp) {
    const scriptName = ns.getScriptName();
    displayHelp({
      ns,
      description:
        'This script auto-hacks all servers based on hack skill and available cracking tools.',
      flagsDefinition,
      additionalLines: [
        `Usage: run ${scriptName} --runtype RUNTYPE [--threads NUMTHREADS]`,
        'Where RUNTYPE is one of: local remote both',
        'and NUMTHREADS is the desired number of threads, defaults to 1.',
        'NOTE: When running remotely, it will use the max number',
        'of threads to use as much of the targets RAM as possible.',
        '',
        'WARN: Running locally will (eventually) use a lot of RAM on the host.',
        'Example:',
        `> run ${scriptName} --runtype remote --threads 6`,
        `> run ${scriptName} --runtype local --threads 1`,
        `> run ${scriptName} --runtype both`,
      ],
    });
    return;
  }

  const currentHost = ns.getHostname();
  const serversMeta = await getServersMeta(ns, currentHost);
  const servers = Object.keys(serversMeta);

  let running = true;
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
      // TODO: do this better
      let target = servers[i];
      if (target == 'darkweb') {
        continue;
      }

      let meta = serversMeta[target];
      if (!meta) {
        ns.print(`WARNING: Could not find metadata for server: ${target}`);
      } else {
        const {
          isRunningLocal,
          isRunningRemote,
          hackSkillMet,
          toolCountMet,
          alreadyHacked,
        } = await collectStatsAgainstTarget({
          ns,
          target,
          currentHost,
          serversMeta,
          hackingSkill,
          hackToolCount,
        });

        const shouldRun =
          hackSkillMet && toolCountMet && (meta.hasMoney || !alreadyHacked);
        const shouldRunLocal =
          shouldRun &&
          !isRunningLocal &&
          (runType === 'local' || runType === 'both');
        const shouldRunRemote =
          shouldRun &&
          !isRunningRemote &&
          (runType === 'remote' || runType === 'both');

        if (shouldRunLocal) {
          startHackWithLogging({
            ns,
            host: currentHost,
            script: meta.factionServer ? hackScriptLocal : hackScriptLocal, // TODO: After SF 4.1 installing the backdoor will be script-able.
            isRemote: false,
            target,
            threads,
            args: [],
          });
        }

        if (shouldRunRemote) {
          // calculate threads to max out remote RAM
          let remoteMemReq = ns.getScriptRam(hackScriptRemote, target);
          let threadCount = Math.floor(meta.totalMem / remoteMemReq);
          startHackWithLogging({
            ns,
            host: currentHost,
            script: crackScript,
            isRemote: true,
            target,
            threadCount,
            args: [hackScriptRemote],
          });
        }
        await ns.sleep(500); // sleep 0.5 second to give time for next server on this pass
      }
    }

    await ns.sleep(SLEEP_TIME);
    ns.print(`Snoozing for ${SLEEP_TIME / 1000} seconds.`);
  } while (running);
}
