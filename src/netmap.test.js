// Do library mocks before importing item under test
jest.mock('./libs/common', () => {
  const originalModule = jest.requireActual('./libs/common');
  return {
    ...originalModule,
    displayHelp: jest.fn().mockReturnValue(undefined),
  };
});

const netmap = require('./netmap');
const { displayHelp } = require('./libs/common');

beforeEach(() => {
  jest.resetAllMocks();
});

describe(__filename, () => {
  test('main creates expected output file when one layer deep', async () => {
    // Arrange
    const nsMock = {
      flags: () => ({ help: false }),
      scan: () => ['home', 'child'],
      getPurchasedServers: () => [],
      getServerRequiredHackingLevel: () => 1,
      getServerNumPortsRequired: () => 0,
      getServerMoneyAvailable: () => 1,
      getServerMaxRam: () => 8,

      write: jest.fn().mockResolvedValue(),
    };

    // Act
    await netmap.main(nsMock);

    // Assert
    expect(nsMock.write.mock.calls.length).toBe(1);
    expect(nsMock.write.mock.calls[0]).toEqual([
      'netmap-data.json',
      JSON.stringify({
        child: {
          reqHackSkill: 1,
          reqNukePorts: 0,
          restartHack: true,
          totalMem: 8,
          hasMoney: true,
        },
      }),
      'w',
    ]);
  });

  test('main creates expected output file when branching connections', async () => {
    // Arrange
    const nsScanMockResults = {
      home: ['child', 'home'],
      child: ['alpha', 'child', 'delta', 'home'],
      alpha: ['alpha', 'child'],
      delta: ['child', 'delta'],
    };
    const moneyMap = {
      alpha: 0,
      child: 5000,
      delta: 1000,
    };
    const securityResults = {
      alpha: {
        reqHackSkill: 5,
        reqNukePorts: 0,
        restartHack: false,
        totalMem: 4,
        hasMoney: false,
      },
      child: {
        reqHackSkill: 1,
        reqNukePorts: 0,
        restartHack: true,
        totalMem: 8,
        hasMoney: true,
      },
      delta: {
        reqHackSkill: 20,
        reqNukePorts: 1,
        restartHack: true,
        totalMem: 16,
        hasMoney: true,
      },
    };
    const nsScanMock = jest
      .fn()
      .mockImplementation((name) => nsScanMockResults[name]);
    const nsMock = {
      flags: () => ({ help: false }),
      scan: nsScanMock,
      getPurchasedServers: () => [],
      getServerRequiredHackingLevel: (name) =>
        securityResults[name].reqHackSkill,
      getServerNumPortsRequired: (name) => securityResults[name].reqNukePorts,
      getServerMoneyAvailable: (name) => moneyMap[name],
      getServerMaxRam: (name) => securityResults[name].totalMem,

      write: jest.fn().mockResolvedValue(),
    };

    // Act
    await netmap.main(nsMock);

    // Assert
    expect(nsMock.write.mock.calls.length).toBe(1);
    expect(nsScanMock.mock.calls.length).toBe(4);
    // Checking the args as a single array with a JSON string is problematic. Check them individually.
    expect(nsMock.write.mock.calls[0][0]).toEqual('netmap-data.json');
    expect(JSON.parse(nsMock.write.mock.calls[0][1])).toEqual(securityResults);
    expect(nsMock.write.mock.calls[0][2]).toEqual('w');
  });

  test('main display help message when help flag is called and does not write file', async () => {
    // Arrange
    const nsMock = {
      flags: () => ({ help: true }),
      getScriptName: () => 'netmap.js',
      write: jest.fn().mockResolvedValue(),
    };

    // Act
    await netmap.main(nsMock);

    // Assert
    expect(nsMock.write.mock.calls.length).toBe(0);
    expect(displayHelp.mock.calls.length).toBe(1);
  });
});
