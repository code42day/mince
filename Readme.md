# mince

Traditional CLI for [mincer](https://github.com/nodeca/mincer)

Supports specifying destination directory for built files.
Builds multiple scripts during one mincer invocation.

## Instalation

npm install mince

## Usage

    mince [options] file..

### --include|-i

Add include directoris

### --destination|-d

Directory to which minces files are build

### --source-map

Name of the generated source map.

### --source-root

Common path prefix for files include in source map.
