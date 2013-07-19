var fs = require('fs');
var path = require('path');

var async = require('async');

var argv = require('optimist')
  .usage('Mince files and place them in destination directory.\nUsage: $0 [options] file..')
  .describe('destination', 'Location of minced files')
  .describe('include', 'Include path for mincer - can be specified multiple times.')
  .alias('d', 'destination')
  .alias('i', 'include')
  .demand('destination')
  .argv;

var mincer = require('mincer');

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
  async.each(src, function(s, fn) {
    var asset = environment.findAsset(s);
    if (!asset) {
      return fn('Cannot find: ' + s);
    }

    asset.compile(function(err) {
      if (err) {
        return fn(err);
      }

      fs.writeFile(path.join(destination, s), asset.buffer, fn);
    });


  }, function(err) {
    if(err) {
      console.error(err);
      process.exit(1);
    }
  });
}

mince(environment(argv.include), argv._, argv.destination);