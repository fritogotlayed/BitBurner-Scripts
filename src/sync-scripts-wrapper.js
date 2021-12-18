/* TODO: Update what this scripts intention is
 */

/**
 * @param {import(".").NS} ns Use just "@param {NS} ns" if editing in game
 */
export async function main(ns) {
  await ns.wget(
    'http://localhost:8080/sync-scripts.js',
    'sync-scripts.js',
    'home',
  );
  ns.exec('sync-scripts.js', 'home', 1);
}
