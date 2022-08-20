/**
 * @param {import(".").NS} ns Use just "@param {NS} ns" if editing in game
 * @param {string} parent the name of the parent of "server"
 * @param {string} server the name of the current server in the chain
 * @param {string} target the node that we are looking for
 * @param {array} route the array of all hops thusfar while looking for our target
 * @returns {boolean} Returns true when the target is found, false otherwise.
 */
// recursiveScan(ns, '', 'home', target, route);
export function recursiveScan(ns, parent, server, target, route) {
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
