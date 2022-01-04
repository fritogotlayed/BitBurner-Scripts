/**
 * Collection of purchasable files in the Bitburner game and some metadata around them.
 */
export const FILES_METADATA = {
  'BruteSSH.exe': { name: 'BruteSSH.exe', cost: 500000, isNukeTool: true },
  'FTPCrack.exe': { name: 'FTPCrack.exe', cost: 1500000, isNukeTool: true },
  'relaySMTP.exe': { name: 'relaySMTP.exe', cost: 5000000, isNukeTool: true },
  'HTTPWorm.exe': { name: 'HTTPWorm.exe', cost: 30000000, isNukeTool: true },
  'SQLInject.exe': { name: 'SQLInject.exe', cost: 250000000, isNukeTool: true },
  'DeepscanV1.exe': { name: 'DeepscanV1.exe', cost: 500000, isNukeTool: false },
  'DeepscanV2.exe': {
    name: 'DeepscanV2.exe',
    cost: 25000000,
    isNukeTool: false,
  },
  'ServerProfiler.exe': {
    name: 'ServerProfiler.exe',
    cost: 500000,
    isNukeTool: false,
  },
  'AutoLink.exe': { name: 'AutoLink.exe', cost: 1000000, isNukeTool: false },
};
