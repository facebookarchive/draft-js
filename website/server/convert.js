var fs = require('fs')
var glob = require('glob');
var mkdirp = require('mkdirp');
var optimist = require('optimist');
var os = require('os');
var path = require('path');
var argv = optimist.argv;

function splitHeader(content) {
  var lines = content.split(os.EOL);
  for (var i = 1; i < lines.length - 1; ++i) {
    if (lines[i] === '---') {
      break;
    }
  }
  return {
    header: lines.slice(1, i + 1).join(os.EOL),
    content: lines.slice(i + 1).join(os.EOL)
  };
}

function backtickify(str) {
  var escaped = '`' + str.replace(/\\/g, '\\\\').replace(/`/g, '\\`') + '`';
  // Replace require( with require\( so node-haste doesn't replace example
  // require calls in the docs
  return escaped.replace(/require\(/g, 'require\\(');
}

function execute() {
  var MD_DIR = '../docs/';

  glob.sync('src/docs/*.*').forEach(function(file) {
    try {
      fs.unlinkSync(file);
    } catch(e) {
      /* seriously, unlink throws when the file doesn't exist :( */
    }
  });

  var metadatas = {
    files: [],
  };

  var files = glob.sync(MD_DIR + '**/*.*');
  files.forEach(function(file) {
    var extension = path.extname(file);
    if (extension === '.md' || extension === '.markdown') {
      var content = fs.readFileSync(file, {encoding: 'utf8'});
      var metadata = {};

      // Extract markdown metadata header
      var both = splitHeader(content);
      var lines = both.header.split(os.EOL);
      for (var i = 0; i < lines.length - 1; ++i) {
        var keyvalue = lines[i].split(':');
        var key = keyvalue[0].trim();
        var value = keyvalue.slice(1).join(':').trim();
        // Handle the case where you have "Community #10"
        try { value = JSON.parse(value); } catch(e) { }
        metadata[key] = value;
      }
      metadatas.files.push(metadata);

      if (metadata.permalink.match(/^https?:/)) {
        return;
      }

      // Create a dummy .js version that just calls the associated layout
      var layout = metadata.layout[0].toUpperCase() + metadata.layout.substr(1) + 'Layout';

      var content = (
        '/**\n' +
        ' * @generated\n' +
        ' */\n' +
        'var React = require("React");\n' +
        'var Layout = require("' + layout + '");\n' +
        'var content = ' + backtickify(both.content) + '\n' +
        'var Post = React.createClass({\n' +
        '  statics: {\n' +
        '    content: content\n' +
        '  },\n' +
        '  render: function() {\n' +
        '    return <Layout metadata={' + JSON.stringify(metadata) + '}>{content}</Layout>;\n' +
        '  }\n' +
        '});\n' +
        'module.exports = Post;\n'
      );

      var targetFile = 'src/' + metadata.permalink.replace(/\.html$/, '.js');
      mkdirp.sync(targetFile.replace(new RegExp('/[^/]*$'), ''));
      fs.writeFileSync(targetFile, content);
    }

    if (extension === '.json') {
      var content = fs.readFileSync(file, {encoding: 'utf8'});
      metadatas[path.basename(file, '.json')] = JSON.parse(content);
    }
  });

  fs.writeFileSync(
    'core/metadata.js',
    '/**\n' +
    ' * @generated\n' +
    ' */\n' +
    'module.exports = ' + JSON.stringify(metadatas, null, 2) + ';'
  );

  fs.writeFileSync('src/lib/Draft.css', fs.readFileSync('../dist/Draft.css'));
  fs.writeFileSync('src/lib/Draft.js', fs.readFileSync('../dist/Draft.js'));
  fs.writeFileSync('src/lib/RichEditor.css', fs.readFileSync('../examples/rich/RichEditor.css'));
}

if (argv.convert) {
  console.log('convert!')
  execute();
}

module.exports = execute;
