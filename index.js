var fs = require('fs');
var path = require('path');

var argv = require('optimist')
  .usage('Mince files and place them in destination directory.\nUsage: $0 [options] file..')
  .describe('destination', 'Location of minced files')
  .describe('include', 'Include path for mincer - can be specified multiple times.')
  .describe('source-map', 'Name of the generated source map.')
  .describe('source-root', 'Common path prefix for files include in source map.')
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
  if (argv['source-map']) {
    environment.enable('source_map');
  }
  if ('source-root' in argv) {
    environment.sourceRoot = argv['source-root'];
  }
  include.forEach(function(i) {
    environment.appendPath(i);
  });
  return environment;
}

function writeFile(path, data) {
  var output = fs.createWriteStream(path);
  data.split('\n').forEach(function(line) {
    // remove processing directives
    if (!line.startsWith('//(=)')) {
      output.write(line);
      output.write('\n');
    }
  });
  output.end();
}

function mince(environment, src, destination) {
  src = toArray(src);
  src.forEach(function(s) {
    var asset = environment.findAsset(s);
    if (!asset) {
      throw 'Cannot find: ' + s;
    }
    var outName = path.join(destination, s);
    var sourceMappingComment = '';
    if (argv['source-map'] && asset.sourceMap) {
      sourceMappingComment = '\n//# sourceMappingURL=' + s + '.map';
      fs.writeFile(outName + '.map', asset.sourceMap);
    }
    writeFile(outName, asset.toString() + sourceMappingComment);
  });
}

try {
  mince(environment(argv.include), argv._, argv.destination);
} catch(e) {
  console.error(e);
  process.exit(1);
}
