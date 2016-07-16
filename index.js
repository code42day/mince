var fs = require('fs');
var path = require('path');

var argv = require('optimist')
  .usage('Mince files and place them in destination directory.\nUsage: $0 [options] file..')
  .describe('destination', 'Location of minced files')
  .describe('include', 'Include path for mincer - can be specified multiple times.')
  .alias('d', 'destination')
  .alias('i', 'include')
  .demand('destination')
  .argv;

var mincer = require('mincer');
var DebugComments = require('./lib/debug-comments.js');


mincer.registerPostProcessor('application/javascript', DebugComments);

function toArray(a) {
  return Array.isArray(a) ? a : [a];
}

function environment(include) {
  include = toArray(include);
  var environment = new mincer.Environment(process.cwd());
  include.forEach(function(i) {
    environment.appendPath(i);
  });
  return environment;
}

function mince(environment, src, destination) {
  src = toArray(src);
  src.forEach(function(s) {
    var asset = environment.findAsset(s);
    if (!asset) {
      throw 'Cannot find: ' + s;
    }
    fs.writeFileSync(path.join(destination, s), asset.toString());
  });
}

try {
  mince(environment(argv.include), argv._, argv.destination);
} catch(e) {
  console.error(e);
  process.exit(1);
}
