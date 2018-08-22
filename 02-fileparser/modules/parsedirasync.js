const fs = require('fs');
const path = require('path');
const util = require('util');

const readDir = util.promisify(fs.readdir);
const statFn = util.promisify(fs.stat);
const mkDir = util.promisify(fs.mkdir);
const copyFile = util.promisify(fs.copyFile);

module.exports = class Parser {
  constructor (input, output) {
    this.statList = {};
    this.names = [];
    this.inputDir = input;
    this.outputDir = output;
  }

  async start () {
    try {
      await this.getFileList(this.inputDir);
      await this.mkDirs();
      await this.copyFiles();
    } catch (err) {
      console.log(err);
    }
  }

  async getFileList (dirName) {
    const res = await readDir(dirName, { encoding: 'utf8' });

    for (const file of res) {
      const elPath = path.join(dirName, file);
      const stat = await statFn(elPath);

      if (stat.isDirectory()) {
        await this.getFileList(elPath);
      } else {
        const firstLetter = file.slice(0, 1).toLowerCase();
        this.statList[elPath] = (firstLetter === '.') ? '!' : firstLetter;
      }
    }
  }

  async mkDirs () {
    const uniq = Array.from(new Set(Object.values(this.statList)));

    await mkDir(this.outputDir);

    for (const dir of uniq) {
      await mkDir(path.join(this.outputDir, dir));
    }
  }

  async copyFiles () {
    Object.keys(this.statList).forEach((currPath, index) => {
      let currPathParsed = path.parse(currPath);
      this.names[index] = [currPathParsed.base, currPath];
    });

    for (let i = 0; i < this.names.length; i++) {
      let counter = 0;
      for (let j = i; j >= 0; j--) {
        if (this.names[i][0] === this.names[j][0]) {
          counter++;
        }
      }
      let before = path.parse(this.names[i][1]);
      let after;
      if (counter > 1) {
        after = path.format({
          dir: `${this.outputDir}\\${before.name.slice(0, 1).toLowerCase()}`,
          name: `${before.name}(${counter})`,
          ext: before.ext
        });
      } else {
        after = path.format({
          dir: `${this.outputDir}\\${before.name.slice(0, 1).toLowerCase()}`,
          name: before.name,
          ext: before.ext
        });
      }
      this.names[i][2] = after;
    }
    for (let i = 0; i < this.names.length; i++) {
      await copyFile(this.names[i][1], this.names[i][2]);
    }
  }
};
