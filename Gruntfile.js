/*global module:false*/
module.exports = function (grunt) {

    grunt.initConfig({

        // Metadata.
        pkg: grunt.file.readJSON('package.json'),
        banner: '/*! \n * <%= pkg.title || pkg.name %> v<%= pkg.version %>\n' +
            ' * <%= pkg.homepage %>\n' +
            ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>\n' +
            ' * License: <%= pkg.license %>\n' +
            ' */\n',

        ngAnnotate: {
            options: {
                singleQuotes: true,
            },
            build: {
                expand: true,
                cwd: 'src',
                src: ['*.js'],
                dest: 'dist'
            }
        },

        jshint: {
            jshintrc: '.jshintrc',
            gruntfile: {
                src: 'Gruntfile.js'
            },
            src: {
                src: ['src/*.js']
            }
        },
        ngtemplates: {
            options: {
                module: 'mindsmash.uxTable',
            },
            build: {
                cwd: 'src',
                src: '*.html',
                dest: 'dist/mindsmash-angular-uxtable.tpls.js'
            }
        },
        // Task configuration.
        uglify: {
            options: {
                banner: '<%= banner %>',
                report: 'gzip'
            },
            build: {
                src: ['dist/mindsmash-angular-uxtable.js', 'dist/mindsmash-angular-uxtable.tpls.js'],
                dest: 'dist/mindsmash-angular-uxtable.min.js'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-ng-annotate');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-angular-templates');

    grunt.registerTask('default', ['jshint', 'ngAnnotate', 'ngtemplates', 'uglify']);
    grunt.registerTask('build', ['default']);
};