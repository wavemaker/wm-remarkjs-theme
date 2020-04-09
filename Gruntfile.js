module.exports = function (grunt) {
    'use strict';

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: {
            folder: "dist"
        },
        copy: {
            main: {
                files: [
                    {
                        expand: true,
                        cwd: './src',
                        dest: './dist',
                        src: [
                            './**/*'
                        ]
                    }
                ]
            }
        },
        run: {
            "build": {
                cmd: 'node',
                args: [
                    'build-slides.js'
                ]
            },
            "build-watch": {
                cmd: 'node',
                args: [
                    'build-slides.js', '--watch'
                ]
            }
        }
    });

    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    grunt.registerTask('build:w', [
        'clean',
        'copy',
        'run:build-watch'
    ]);

    grunt.registerTask('build', [
        'clean',
        'copy',
        'run:build'
    ]);

    grunt.registerTask('default', ['build']);
};
