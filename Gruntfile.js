module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    "mozilla-addon-sdk": {
      'stable': {
        options: {
          revision: "1.15"
        }
      }
    },
    "mozilla-cfx-xpi": {
      'stable': {
        options: {
          "mozilla-addon-sdk": "stable",
          extension_dir: "extension/firefox",
          dist_dir: "dist/firefox"
        }
      }
    },
    "mozilla-cfx": {
      'stable': {
        options: {
          "mozilla-addon-sdk": "stable",
          extension_dir: "extension/firefox",
          command: "run",
          arguments: "-p /tmp/snap-ratings"
        }
      }
    },

    jshint: {
      files: [
        'Gruntfile.js',

        'extension/shared/**/*.js',

        'extension/firefox/data/*.js',
        'extension/firefox/lib/*.js',

        'extension/chrome/*.js'
      ],
      options: {
        // options here to override JSHint defaults
        globals: {
          jQuery: true
        }
      }
    },
    watch: {
      files: ['<%= jshint.files %>'],
      tasks: ['jshint']
    },

    copy: {
      ff: {
            options: {
              processContent: function(content, file) {
                switch(file) {
                  case 'bower_components/jquery/jquery.min.js':
                    // remove sourcemap, mozilla addons complains about //@ ...
                    return content.replace('//@ sourceMappingURL=jquery.min.map','');
                }
                return content;
              }
            },
        files: [
          {expand: true, cwd: 'extension/shared/', src: ['**'], dest: 'extension/firefox/data/shared/'},
          {
            flatten: true,
            src: ['bower_components/jquery/jquery.min.js'],
            dest: 'extension/firefox/data/components/jquery.min.js',
            filter: 'isFile'
          }
        ]
      },
      chrome: {
        files: [
          {expand: true, cwd: 'extension/shared/', src: ['**'], dest: 'extension/chrome/shared/'},
          {expand: true, cwd: 'bower_components/components-font-awesome/', src: ['css/**/*.min.css', 'fonts/**'], dest: 'extension/chrome/components/font-awesome/'},
          {flatten: true, src: ['bower_components/jquery/jquery.min.js'], dest: 'extension/chrome/components/jquery.min.js', filter: 'isFile'}
        ]
      }
    },

    compress: {
      chrome: {
        options: {
          archive: 'dist/chrome/<%= pkg.name %>.zip',
          level: 9,
          pretty: true
        },
        files: [
          {expand:true, cwd: 'extension/chrome', src: ['**'], dest: '/'}
        ]
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-mozilla-addon-sdk');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-compress');

  grunt.registerTask('ff:dev', ["copy:ff", "mozilla-cfx:stable"]);
  grunt.registerTask('ff:dist', ["copy:ff", "mozilla-cfx-xpi:stable"]);

  grunt.registerTask('chrome:dev', ["copy:chrome"]);
  grunt.registerTask('chrome:dist', ["copy:chrome", 'compress:chrome']);

  grunt.registerTask('setup', ["mozilla-addon-sdk"]);

  grunt.registerTask('dist', ['jshint', 'ff:dist', 'chrome:dist']);
  grunt.registerTask('default', ['setup', 'dist']);

};