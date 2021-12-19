/* TODO: Update what this scripts intention is
 */

/**
 * @param {import(".").NS} ns Use just "@param {NS} ns" if editing in game
 * @param {string} parent
 * @param {string} server
 * @param {string} target
 * @param {array} route
 * @returns {boolean}
 */
function recursiveScan(ns, parent, server, target, route) {
  // Get the children of the machine we're on
  const children = ns.scan(server);

  for (let i = 0; i < children.length; i += 1) {
    const child = children[i];

    // Don't go "backwards"
    if (parent === child) {
      continue;
    }

    // If we found our target
    if (child === target) {
      route.unshift(child);
      route.unshift(server);
      return true;
    }

    // Keep on looking...
    if (recursiveScan(ns, server, child, target, route)) {
      route.unshift(server);
      return true;
    }
  }

  return false;
}

/**
 * @param {import(".").NS} ns Use just "@param {NS} ns" if editing in game
 */
export async function main(ns) {
  const args = ns.flags([['help', false]]);
  let route = [];
  let target = args._[0];

  if (!target || args.help) {
    ns.tprint(
      'This script helps you find a server on the network and shows you the path to get to it.',
    );
    ns.tprint(`Usage: run ${ns.getScriptName()} SERVER`);
    ns.tprint('Example:');
    ns.tprint(`> run ${ns.getScriptName()} n00dles`);
    return;
  }

  recursiveScan(ns, '', 'home', target, route);
  for (const i in route) {
    const extra = i > 0 ? 'ட ' : '';
    ns.tprint(`${'  '.repeat(i)}${extra}${route[i]}`);
  }
}

export function autocomplete(data, args) {
  return data.servers;
}
