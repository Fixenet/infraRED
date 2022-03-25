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
            all: ['Gruntfile.js', 'development/infraRED-client/js/**/*.js', 'development/infraRED-api/js/**/*.js'],
        },
        concat: {
            options: {
                separator: '\n\n',
            },
            js: {
                src: [
                    // Load infraRED.js first, then each sub module and then the main
                    'development/infraRED-client/js/infraRED.js',
                    'development/infraRED-client/js/events.js',
                    'development/infraRED-client/js/validator.js',
                    'development/infraRED-client/js/nodes.js',
                    'development/infraRED-client/js/relationships.js',

                    // Respect ui's hierarchy
                    'development/infraRED-client/js/ui/editor.js',
                    'development/infraRED-client/js/ui/category.js',
                    'development/infraRED-client/js/ui/node.js',

                    'development/infraRED-client/js/main.js',
                ],
                dest: 'distribution/js/infraRED.js',
            },
        },
        sass: {
            build: {
                options: {
                    implementation: sass,
                    outputStyle: 'compressed'
                },
                files: [{
                    src: 'development/infraRED-client/sass/style.scss',
                    dest: 'distribution/public/style.min.css',
                }]
            }
        },
        watch: {
            js: {
                files: 'development/infraRED-client/js/**/*.js',
                tasks: ['build'],
            },
            sass: {
                files: 'development/infraRED-client/sass/**/*.scss',
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