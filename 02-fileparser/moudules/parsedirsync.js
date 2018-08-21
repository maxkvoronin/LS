const fs = require('fs');
const path = require('path');

module.exports = class Parser {
  constructor (input, output) {
    this.statList = {};
    this.names = [];

    this.inputDir = input;
    this.outputDir = output;
  }

  start () {
    this.getFileList(this.inputDir);
    this.mkDirs();
    this.copyFiles();
  }

  getFileList (dirName) {
    const list = fs.readdirSync(dirName, 'utf8');

    list.forEach(element => {
      let elPath = path.join(dirName, element);
      let stat = fs.statSync(elPath);

      if (stat.isDirectory()) {
        this.getFileList(elPath);
      } else {
        let firstLetter = element.slice(0, 1).toLowerCase();
        this.statList[elPath] = (firstLetter === '.') ? '!' : firstLetter;
      }
    });
  }

  mkDirs () {
    const uniq = Array.from(new Set(Object.values(this.statList)));
    fs.mkdirSync(this.outputDir);
    uniq.forEach(dir => {
      fs.mkdirSync(path.join(this.outputDir, dir));
    });
  }

  copyFiles () {
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
      fs.copyFileSync(this.names[i][1], this.names[i][2]);
    }
  }
};
