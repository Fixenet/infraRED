var sass = require("sass");

module.exports = function(grunt) {
    // Do grunt-related things in here
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            options: {
                esversion: 6
            },
            all: ['Gruntfile.js', 'development/infraRED-client/js/**/*.js', 'development/infraRED-api/js/**/*.js'],
            client: ['development/infraRED-client/js/**/*.js'],
            api: ['development/infraRED-api/js/**/*.js'],
        },
        concat: {
            options: {
                separator: '\n',
            },
            client: {
                src: [
                    // Load infraRED.js first, then each sub module and then the main
                    'development/infraRED-client/js/infraRED.js',
                    'development/infraRED-client/js/events.js',
                    'development/infraRED-client/js/validator.js',
                    'development/infraRED-client/js/canvas.js',
                    'development/infraRED-client/js/nodes.js',
                    'development/infraRED-client/js/relationships.js',
                    'development/infraRED-client/js/loader.js',

                    // Respect ui's hierarchy
                    'development/infraRED-client/js/ui/editor.js',
                    'development/infraRED-client/js/ui/category.js',
                    'development/infraRED-client/js/ui/resource.js',
                    'development/infraRED-client/js/ui/canvas.js',
                    'development/infraRED-client/js/ui/menu.js',
                    'development/infraRED-client/js/ui/status.js',
                    'development/infraRED-client/js/ui/nodes.js',
                    'development/infraRED-client/js/ui/relationships.js',

                    'development/infraRED-client/js/main.js',
                ],
                dest: 'distribution/public/infraRED.js',
            },
            api: {
                // using this as a copy, because i can just import the files
                src: [
                    'development/infraRED-api/js/index.js',
                ],
                dest: 'distribution/index.js',
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
            clientJS: {
                files: 'development/infraRED-client/js/**/*.js',
                tasks: ['build-client'],
            },
            apiJS: {
                files: 'development/infraRED-api/js/**/*.js',
                tasks: ['build-api'],
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
    grunt.registerTask('build-client', ['jshint:client', 'concat:client']);
    grunt.registerTask('build-api', ['jshint:api', 'concat:api']);
    grunt.registerTask('build', ['build-client', 'build-api', 'sass']);
    grunt.registerTask('default', ['build', 'watch']);
};