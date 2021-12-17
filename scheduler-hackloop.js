const hackTools = [
    'BruteSSH.exe',
    'FTPCrack.exe',
    'HTTPWorm.exe',
    'relaySMTP.exe',
    'SQLInject.exe',
];

const servers = [
    'CSEC',
    'foodnstuff',
    'harakiri-sushi',
    'hong-fang-tea',
    'iron-gym',
    'joesguns',
    'max-hardware',
    'n00dles',
    'nectar-net',
    'neo-net',
    'omega-net',
    'phantasy',
    'sigma-cosmetics',
    'silver-helix',
    'zer0'
];

const serversMeta = {
    'CSEC': {
        reqHackSkill: 58,
        reqNukePorts: 1,
        restartHack: false,
        runScript: 'backdoor.js',
    },
    'foodnstuff': {
        reqHackSkill: 1,
        reqNukePorts: 0,
        restartHack: true,
    },
    'harakiri-sushi': {
        reqHackSkill: 40,
        reqNukePorts: 0,
        restartHack: true,
    },
    'hong-fang-tea': {
        reqHackSkill: 30,
        reqNukePorts: 0,
        restartHack: true,
    },
    'iron-gym': {
        reqHackSkill: 100,
        reqNukePorts: 1,
        restartHack: true,
    },
    'joesguns': {
        reqHackSkill: 10,
        reqNukePorts: 0,
        restartHack: true,
    },
    'max-hardware': {
        reqHackSkill: 80,
        reqNukePorts: 1,
        restartHack: true,
    },
    'n00dles': {
        reqHackSkill: 1,
        reqNukePorts: 0,
        restartHack: true,
    },
    'nectar-net': {
        reqHackSkill: 20,
        reqNukePorts: 0,
        restartHack: true,
    },
    'neo-net': {
        reqHackSkill: 50,
        reqNukePorts: 1,
        restartHack: true,
    },
    'omega-net': {
        reqHackSkill: 208,
        reqNukePorts: 2,
        restartHack: true,
    },
    'phantasy': {
        reqHackSkill: 100,
        reqNukePorts: 2,
        restartHack: true,
    },
    'sigma-cosmetics': {
        reqHackSkill: 5,
        reqNukePorts: 0,
        restartHack: true,
    },
    'silver-helix': {
        reqHackSkill: 150,
        reqNukePorts: 2,
        restartHack: true,
    },
    'zer0': {
        reqHackSkill: 75,
        reqNukePorts: 1,
        restartHack: true,
    },
}

/**
 * @param {import(".").NS} ns Use just "@param {NS} ns" if editing in game
 */
export async function main(ns) {
    /* TODO
     * Check available memory and purchase "home" memory in loop
     * CSEC doesn't have money. No real reason to continue the script once hacked first time
     */
    const hackScript = 'hackloop.js';
    const homeHost = 'home';
    const sleepTime = 1000 * 60; // milliseconds
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

        for (let i = 0; i < servers.length; i += 1) {
            let target = servers[i];
            let meta = serversMeta[target];
            if (!meta) {
                ns.print(`WARNING: Could not find metadata for server: ${target}`);
            } else {
                // Check if a script is running
                const isRunning = ns.isRunning(hackScript, homeHost, target);

                // Check if the server is hacked and we could hack it
                const shouldRun = (
                    hackingSkill >= meta.reqHackSkill
                    && hackToolCount >= meta.reqNukePorts
                    && !isRunning
                    && (meta.restartHack || !ns.hasRootAccess(target))
                );
                if (shouldRun) {
                    ns.exec(meta.runScript || 'hackloop.js', 'home', 1, target);
                    const remotePid = ns.exec('prepServer.js', 'home', 1, target, 'hackloop-remote.js');
                    ns.tprint(`Spawning on remote ${target} pid ${remotePid}`);
                }
            }
        };

        await ns.sleep(sleepTime);
    } while (running)
}
