const program = require('commander');
const Parser = require('./modules/parsedirsync');

program
  .version('0.0.2')
  .usage('[options] <directory ...>')
  .option('-i, --inputDir <input directory>', 'directory for parsing')
  .option('-o, --outputDir <output directory>', 'output directory')
  .parse(process.argv);

if (program.inputDir) {
  console.log('input directory: ', program.inputDir);
}
if (program.outputDir) {
  console.log('output directory: ', program.outputDir);
}

const parser = new Parser(program.inputDir, program.outputDir);

parser.start();
