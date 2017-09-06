/*
 * grunt-base64-less
 * https://github.com/subasteve/grunt-base64-less
 *
 * Copyright (c) 2014 subasteve
 * Licensed under the Apache 2.0 licenses.
 */

'use strict';

module.exports = function(grunt) {

  require('load-grunt-tasks')(grunt);

  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js',
        '<%= nodeunit.tests %>'
      ],
      options: {
        jshintrc: '.jshintrc'
      },
    },

    // Unit tests.
    nodeunit: {
      tests: ['test/*.js']
    }
  });


  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['nodeunit']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test']);

};
