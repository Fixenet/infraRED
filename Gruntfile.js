var sass = require("sass");

module.exports = function(grunt) {
    // Do grunt-related things in here
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            options: {
                esversion: 8
            },
            all: ['Gruntfile.js', 'development/infraRED-client/js/**/*.js', 'development/infraRED-server/js/**/*.js'],
            nodes: ['development/infraRED-nodes/**/*.js', 'development/infraRED-nodes/*.js'],
            client: ['development/infraRED-client/js/**/*.js'],
            server: ['development/infraRED-server/js/**/*.js'],
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
                    'development/infraRED-client/js/settings.js',
                    'development/infraRED-client/js/canvas.js',
                    'development/infraRED-client/js/nodes.js',
                    'development/infraRED-client/js/relationships.js',
                    'development/infraRED-client/js/loader.js',
                    'development/infraRED-client/js/deployer.js',

                    // Respect ui's hierarchy
                    'development/infraRED-client/js/ui/editor.js',
                    'development/infraRED-client/js/ui/category.js',
                    'development/infraRED-client/js/ui/resource.js',
                    'development/infraRED-client/js/ui/canvas.js',
                    'development/infraRED-client/js/ui/menu.js',
                    'development/infraRED-client/js/ui/status.js',
                    'development/infraRED-client/js/ui/nodes.js',

                    'development/infraRED-client/js/main.js',
                ],
                dest: 'distribution/infraRED.js',
            },
        },
        copy: {
            nodes: { 
                expand: true, 
                cwd: 'development/infraRED-nodes/',
                src: '**', 
                dest: 'distribution/nodes/',
                filter: 'isFile'
            },
            server: {
                expand: true,
                cwd: './development/infraRED-server/js',
                src: 'index.js',
                dest: 'distribution/',
            },
            server_modules: {
                expand: true,
                cwd: 'development/infraRED-server/js/modules/',
                src: ['*.js', '**/*.js', '!js/index.js'],
                dest: 'distribution/modules',
                filter: 'isFile'
            }
        },
        clean: {
            nodes: ['distribution/nodes/'],
            server_modules: ['distribution/modules/'],
        },
        sass: {
            build: {
                options: {
                    implementation: sass,
                    outputStyle: 'compressed'
                },
                files: [{
                    src: 'development/infraRED-client/sass/style.scss',
                    dest: 'distribution/assets/style.min.css',
                }]
            }
        },
        watch: {
            nodesJS: {
                files: 'development/infraRED-nodes/**/*.js',
                tasks: ['build-nodes'],
            },
            clientJS: {
                files: 'development/infraRED-client/js/**/*.js',
                tasks: ['build-client'],
            },
            serverJS: {
                files: 'development/infraRED-server/js/**/*.js',
                tasks: ['build-server'],
            },
            sass: {
                files: 'development/infraRED-client/sass/**/*.scss',
                tasks: ['sass'],
            }
        },
    });

    // Load the plugins
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-sass');

    // Default task(s).
    grunt.registerTask('build-nodes', ['jshint:nodes', 'clean:nodes', 'copy:nodes']);
    grunt.registerTask('build-client', ['jshint:client', 'concat:client']);
    grunt.registerTask('build-server', ['jshint:server', 'copy:server', 'clean:server_modules', 'copy:server_modules']);
    grunt.registerTask('build', ['build-nodes', 'build-client', 'build-server', 'sass']);
    grunt.registerTask('default', ['build', 'watch']);
};