const netmap = require('./netmap');

describe(__filename, () => {
  test('main creates expected output file when one layer deep', async () => {
    // Arrange
    const nsMock = {
      scan: () => ['home', 'child'],
      getPurchasedServers: () => [],
      getServerRequiredHackingLevel: () => 1,
      getServerNumPortsRequired: () => 0,
      getServerMoneyAvailable: () => 1,
      getServerMaxRam: () => 8,
      getServerMoneyAvailable: () => 1,

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
});
