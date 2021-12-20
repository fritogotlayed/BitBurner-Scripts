/* TODO: Update what this scripts intention is
 */

/**
 * @param {import(".").NS} ns Use just "@param {NS} ns" if editing in game
 */
export async function main(ns) {
  const host = ns.getHostname();
  await ns.wget(
    'http://localhost:8080/sync-scripts.js',
    'sync-scripts.js',
    host,
  );
  ns.exec('sync-scripts.js', host, 1);
}
