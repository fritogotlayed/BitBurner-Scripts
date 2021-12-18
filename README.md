# BitBurner Scripts

This is a repository for various BitBurner scripts. It is by no means a complete set of scripts to zero-player the game.

The fastest way to get up and running with using VSCode and this repository is to execute the `./devScripts/initialSetup`
script. This will handle creating all the various components in order to get quickly into the BitBurner game locally.

## Getting scripts into the BitBurner game

* Run the web server via the configured launch.json endpoint or direcly via node
* In the BitBurner terminal type `wget http://localhost:8080/sync-scripts.js sync-scripts.js`
* Run the sync script to get scripts on your BitBurner computer: `run sync-scripts.js`

## Useful Links

* [BitBurner Game](https://danielyxie.github.io/bitburner/)
* [BitBurner Official Basic Documentation](https://bitburner.readthedocs.io/en/latest/index.html)
* [BitBurner Official Full Documentation](https://github.com/danielyxie/bitburner/blob/dev/markdown/bitburner.ns.md)
* [BitBurner Official Reference Scripts](https://github.com/bitburner-official/bitburner-scripts)
* [Faction Information](https://bitburner.readthedocs.io/en/latest/basicgameplay/factions.html)

## Important notes

* It does not appear that you can import/require in another file when inside of a js file. Script accordingly.