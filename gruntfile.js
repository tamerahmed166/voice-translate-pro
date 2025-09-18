module.exports = function(grunt) {
  // Project configuration
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    
    // Clean task
    clean: {
      dist: ['dist/**/*']
    },
    
    // Copy task
    copy: {
      html: {
        files: [{
          expand: true,
          src: ['*.html'],
          dest: 'dist/',
          filter: 'isFile'
        }]
      },
      assets: {
        files: [{
          expand: true,
          src: ['manifest.json', 'sw.js', 'robots.txt', 'sitemap.xml'],
          dest: 'dist/',
          filter: 'isFile'
        }]
      }
    },
    
    // Uglify task
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: 'script.js',
        dest: 'dist/js/bundle.min.js'
      }
    },
    
    // CSS minification
    cssmin: {
      target: {
        files: [{
          expand: true,
          src: ['styles.css'],
          dest: 'dist/css/',
          ext: '.min.css'
        }]
      }
    },
    
    // Image optimization
    imagemin: {
      dynamic: {
        files: [{
          expand: true,
          cwd: 'assets/',
          src: ['**/*.{png,jpg,jpeg,gif,svg}'],
          dest: 'dist/assets/'
        }]
      }
    },
    
    // HTML minification
    htmlmin: {
      dist: {
        options: {
          removeComments: true,
          collapseWhitespace: true
        },
        files: [{
          expand: true,
          src: ['*.html'],
          dest: 'dist/',
          ext: '.html'
        }]
      }
    },
    
    // Watch task
    watch: {
      html: {
        files: ['*.html'],
        tasks: ['copy:html', 'htmlmin']
      },
      css: {
        files: ['styles.css'],
        tasks: ['cssmin']
      },
      js: {
        files: ['script.js'],
        tasks: ['uglify']
      },
      images: {
        files: ['assets/**/*.{png,jpg,jpeg,gif,svg}'],
        tasks: ['imagemin']
      }
    },
    
    // Browser sync
    browserSync: {
      dev: {
        bsFiles: {
          src: ['dist/**/*']
        },
        options: {
          server: {
            baseDir: 'dist'
          }
        }
      }
    }
  });
  
  // Load plugins
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-imagemin');
  grunt.loadNpmTasks('grunt-contrib-htmlmin');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-browser-sync');
  
  // Default task
  grunt.registerTask('default', ['clean', 'copy', 'uglify', 'cssmin', 'imagemin', 'htmlmin']);
  
  // Development task
  grunt.registerTask('dev', ['default', 'browserSync', 'watch']);
  
  // Production task
  grunt.registerTask('prod', ['default']);
};
