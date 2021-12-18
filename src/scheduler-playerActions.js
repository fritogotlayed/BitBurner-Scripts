/* TODO: Update what this scripts intention is
 */

const programRequirements = [
  { name: 'BruteSSH.exe', hackSkill: 50 },
  { name: 'FTPCrack.exe', hackSkill: 100 },
  { name: 'relaySMTP.exe', hackSkill: 250 },
  { name: 'HTTPWorm.exe', hackSkill: 500 },
  { name: 'SQLInject.exe', hackSkill: 750 },
  { name: 'DeepscanV1.exe', hackSkill: 75 },
  { name: 'DeepscanV2.exe', hackSkill: 400 },
  { name: 'ServerProfiler.exe', hackSkill: 75 },
  { name: 'AutoLink.exe', hackSkill: 25 },
];

/**
 * @param {import(".").NS} ns Use just "@param {NS} ns" if editing in game
 */
const writePrograms = async (ns) => {
  const playerHackingSkill = ns.getPlayer().hacking;
  for (let i = 0; i < programRequirements.length; i++) {
    const meta = programRequirements[i];
    if (!ns.fileExists(meta.name) && playerHackingSkill >= meta.hackSkill) {
      ns.exec('createProgram.js', 'home', 1, meta.name);
    }
  }
};

/**
 * @param {import(".").NS} ns Use just "@param {NS} ns" if editing in game
 */
export async function main(ns) {
  // NOTE: will not work until proper source file obtained
  while (true) {
    if (!ns.isBusy()) {
      await writePrograms(ns);
    }

    await ns.sleep(60 * 1000);
  }
}
