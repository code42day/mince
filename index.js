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
var RemoveProcessingDirectives = require('./lib/remove-processing-directives.js');

mincer.registerPostProcessor('application/javascript', DebugComments);
mincer.registerPostProcessor('application/javascript', RemoveProcessingDirectives);

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

function mince(environment, src, destination, fn) {
  var operations;

  function done(err) {
    if (err) {
      operations = -1;
      // only notify about the first error
      return fn(err);
    }
    if (--operations === 0) {
      // we are done here
      fn();
    }
  }

  src = toArray(src);
  operations += src.length;

  src.forEach(function(s) {
    var asset = environment.findAsset(s);
    if (!asset) {
      throw 'Cannot find: ' + s;
    }

    var outName = path.join(destination, s);
    var source = asset.toString();

    if (argv['source-map'] && asset.sourceMap) {
      operations += 1;
      source += '\n//# sourceMappingURL=' + s + '.map';
      fs.writeFile(outName + '.map', asset.sourceMap, done);
    }

    fs.writeFile(outName, source, done);
  });
}

try {
  mince(environment(argv.include), argv._, argv.destination, function(err) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
  });
} catch(e) {
  console.error(e);
  process.exit(1);
}
