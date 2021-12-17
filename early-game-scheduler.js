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
    },
    'foodnstuff': {
        reqHackSkill: 1,
        reqNukePorts: 0,
    },
    'harakiri-sushi': {
        reqHackSkill: 40,
        reqNukePorts: 0,
    },
    'hong-fang-tea': {
        reqHackSkill: 30,
        reqNukePorts: 0,
    },
    'iron-gym': {
        reqHackSkill: 100,
        reqNukePorts: 1,
    },
    'joesguns': {
        reqHackSkill: 10,
        reqNukePorts: 0,
    },
    'max-hardware': {
        reqHackSkill: 80,
        reqNukePorts: 1,
    },
    'n00dles': {
        reqHackSkill: 1,
        reqNukePorts: 0,
    },
    'nectar-net': {
        reqHackSkill: 20,
        reqNukePorts: 0,
    },
    'neo-net': {
        reqHackSkill: 50,
        reqNukePorts: 1,
    },
    'omega-net': {
        reqHackSkill: 208,
        reqNukePorts: 2,
    },
    'phantasy': {
        reqHackSkill: 100,
        reqNukePorts: 2,
    },
    'sigma-cosmetics': {
        reqHackSkill: 5,
        reqNukePorts: 0,
    },
    'silver-helix': {
        reqHackSkill: 150,
        reqNukePorts: 2,
    },
    'zer0': {
        reqHackSkill: 75,
        reqNukePorts: 1,
    },
}

/**
 * @param {import(".").NS} ns Use just "@param {NS} ns" if editing in game
 */
export async function main(ns) {
    /* TODO
     * Check available memory and purchase "home" memory in loop
     * Check number of port exe's available before starting hack
     */
    const hackScript = 'hackloop.js';
    const homeHost = 'home';
    const sleepTime = 1000 * 60; // milliseconds
    let running = true;
    do {
        const hackingSkill = ns.getPlayer().hacking;
        ns.print(`hackingSkill: ${hackingSkill}`);

        for (let i = 0; i < servers.length; i += 1) {
            let target = servers[i];
            let meta = serversMeta[target];
            if (!meta) {
                ns.print(`WARNING: Could not find metadata for server: ${target}`);
            } else {
                // Check if a script is running
                const isRunning = ns.isRunning(hackScript, homeHost, target);

                // Check if the server is hacked and we could hack it
                if (hackingSkill > meta.reqHackSkill && !isRunning) {
                    ns.exec('hackloop.js', 'home', 1, target);
                }
            }
        };

        await ns.sleep(sleepTime);
    } while (running)
}
