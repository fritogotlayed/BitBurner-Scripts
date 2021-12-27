function getGreaterLength(currentMax, itemToCheck) {
  if (itemToCheck === null || itemToCheck === undefined) return currentMax;
  switch (typeof itemToCheck) {
    case 'boolean':
      if (itemToCheck) {
        return currentMax > 4 ? currentMax : 4; // "true"
      } else {
        return 5; // "false"
      }
    case 'number':
      const asString = itemToCheck.toString();
      return currentMax > asString.length ? currentMax : asString.length;
    case 'string':
      return currentMax > itemToCheck.length ? currentMax : itemToCheck.length;
    default:
      throw new Error(`Missing mapping for type: ${typeof itemToCheck}`);
  }
}

/**
 * @param {object} args
 * @param {import(".").NS} args.ns Use just "@param {NS} ns" if editing in game
 * @param {string} description the short description to print
 * @param {} additionalLines
 */
export function displayHelp({
  ns,
  description,
  flagsDefinition,
  additionalLines,
}) {
  // Find the max lengths to help format to the screen
  const maxLengths = { key: -1, value: -1, description: -1 };

  if (flagsDefinition) {
    for (let i = 0; i < flagsDefinition.length; i++) {
      const item = flagsDefinition[i];
      maxLengths.key = getGreaterLength(maxLengths.key, item[0]);
      maxLengths.value = getGreaterLength(maxLengths.key, item[1]);
      maxLengths.description = getGreaterLength(maxLengths.key, item[2]);
    }
  }

  // Print the help
  ns.tprint(description);

  if (flagsDefinition) {
    ns.tprint('Flags:');
    for (let i = 0; i < flagsDefinition.length; i++) {
      const item = flagsDefinition[i];
      const [padKey, padVal, padDes] = [
        item[0].toString().padEnd(maxLengths.key, '.'),
        item[1].toString().padStart(maxLengths.value, '.'),
        item[2] || '',
      ];

      ns.tprint(`  ${padKey} -- default ${padVal} -- ${padDes}`);
    }
  }

  if (additionalLines) {
    for (let i = 0; i < additionalLines.length; i++) {
      ns.tprint(additionalLines[i]);
    }
  }
}
