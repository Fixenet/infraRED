module.exports = function(grunt) {
    // Do grunt-related things in here
    const filesToWatchAndBuild = ['Gruntfile.js', 'my_modules/**/*.js', '!my_modules/deprecated/**'];
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            options: {
                esversion: 6
            },
            all: filesToWatchAndBuild,
        },
        concat: {
            options: {
                separator: '\n\n',
            },
            deploy: {
                // Load infraRED.js first, then each sub module and then the main
                src: [
                    'my_modules/infraRED/infraRED.js',
                    'my_modules/infraRED/events.js',
                    'my_modules/infraRED/nodes.js',
                    'my_modules/infraRED/relationships.js',
                    'my_modules/infraRED/main.js',
                ],
                dest: 'dist/infraRED.js',
            },
        },
        nodemon: {
            dev: {
                script: 'dist/infraRED.js',
                ignore:  ['node_modules/**'],
            }
        },
        watch: {
            scripts: {
                files: filesToWatchAndBuild,
                tasks: ['build'],
            }
        },
        concurrent: {
            dev: {
                tasks: ['nodemon', 'watch'],
                options: {
                    logConcurrentOutput: true
                }
            }
        }
    });

    // Load the plugins
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-nodemon');
    grunt.loadNpmTasks('grunt-concurrent');

    // Default task(s).
    grunt.registerTask('build', ['jshint:all', 'concat:deploy']);
    grunt.registerTask('default', ['concurrent']);

};