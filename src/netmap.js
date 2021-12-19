/* TODO: Update what this scripts intention is
 */

/**
 * @param {import(".").NS} ns Use just "@param {NS} ns" if editing in game
 */
const hydrateServers = (ns, data, node) => {
  const children = ns.scan(node);
  children.forEach((server) => {
    const isNetTarget =
      data[server] === undefined &&
      server !== 'home' && // ignore our starter computer
      server.indexOf('home-minion-') !== 0; // ignore auto-purchased computers
    if (isNetTarget) {
      data[server] = {
        reqHackSkill: ns.getServerRequiredHackingLevel(server),
        reqNukePorts: ns.getServerNumPortsRequired(server),
        restartHack: !!ns.getServerMoneyAvailable(server),
      };
      hydrateServers(ns, data, server);
    }
  });
};

/**
 * @param {import(".").NS} ns Use just "@param {NS} ns" if editing in game
 */
export async function main(ns) {
  const data = {};

  hydrateServers(ns, data, 'home');

  ns.write('netmap-data.json', JSON.stringify(data), 'w');
}
