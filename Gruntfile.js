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
            build: {
                cmd: 'node',
                args: [
                    'build-slides.js'
                ]
            }
        }
    });

    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    grunt.registerTask('build', [
        'clean',
        'copy',
        'run'
    ]);

    grunt.registerTask('default', ['build']);
};
