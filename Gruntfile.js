var sass = require("sass");

module.exports = function(grunt) {
    // Do grunt-related things in here

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            options: {
                esversion: 6
            },
            all: ['Gruntfile.js', 'my_modules/infraRED/js/**/*.js'],
        },
        concat: {
            options: {
                separator: '\n\n',
            },
            js: {
                src: [
                    // Load infraRED.js first, then each sub module and then the main
                    'my_modules/infraRED/js/infraRED.js',
                    'my_modules/infraRED/js/events.js',
                    'my_modules/infraRED/js/validator.js',
                    'my_modules/infraRED/js/nodes.js',
                    'my_modules/infraRED/js/relationships.js',

                    // Respect ui's hierarchy
                    'my_modules/infraRED/js/ui/editor.js',
                    'my_modules/infraRED/js/ui/category.js',
                    'my_modules/infraRED/js/ui/node.js',

                    'my_modules/infraRED/js/main.js',
                ],
                dest: 'dist/public/infraRED.js',
            },
        },
        sass: {
            build: {
                options: {
                    implementation: sass,
                    outputStyle: 'compressed'
                },
                files: [{
                    src: 'my_modules/infraRED/sass/style.scss',
                    dest: 'dist/public/style.min.css',
                }]
            }
        },
        watch: {
            js: {
                files: 'my_modules/infraRED/js/**/*.js',
                tasks: ['build'],
            },
            sass: {
                files: 'my_modules/infraRED/sass/**/*.scss',
                tasks: ['sass'],
            }
        },
    });

    // Load the plugins
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-sass');

    // Default task(s).
    grunt.registerTask('build', ['jshint', 'concat:js']);
    grunt.registerTask('default', ['watch']);
};