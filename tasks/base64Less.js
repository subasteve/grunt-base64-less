/*
 * grunt-base64-less
 * https://github.com/subasteve/grunt-base64-less
 *
 * Copyright (c) 2014 Subasteve
 * Licensed under the Apache 2.0 licenses.
 */

/*jshint loopfunc: true */

'use strict';

module.exports = function (grunt) {

    var mime = require('mime'),
        fs = require('fs'),
        sizer = require('image-size'),
        gm = require('gm'),
        output = "",
        pending = [],
        completeTimer = null,
        variableChar = "@",
        prefix = "";

    function getSafeFileName(fileName){
        if(fileName.indexOf("/") > -1){
            fileName = fileName.substring(fileName.lastIndexOf("/") + 1);
        }
        return fileName.replace(".", "_").replace("@", "_");
    }

    function createVar(safeFileName,variable,value){
        if(!value){
            value = "\"\"";
        }

        if(variableChar === "$"){
            value = " "+value;
        }

        if(variable){
            variable = "_" + variable;
        }else{
            variable = "";
        }
        return variableChar + prefix + safeFileName + variable + ":" + value + ";\n";
    }

    function encode(fileName) {
        var contents = fs.readFileSync(fileName),
            base64Contents = contents.toString('base64'),
            safeFileName = getSafeFileName(fileName);
        grunt.log.writeln('Base64 encoded "' + fileName + '" to ' + prefix + safeFileName + ' less entry.');
        return {
            safeFileName: safeFileName,
            data: createVar(safeFileName,null,"\"data:" + mime.lookup(fileName) + ";base64," + base64Contents + "\"")
        };
    }

    function getDimensions(fileName){
        return sizer(fileName);
    }

    function writeDimensions(safeFileName, dimensions) {
        return createVar(safeFileName,"width",dimensions.width+"px") + createVar(safeFileName,"height",dimensions.height+"px");
    }

    function create(fileName, dimensions) {
        var encoded = encode(fileName);

        return (!dimensions) ? encoded.data : encoded.data + writeDimensions(encoded.safeFileName, dimensions);
    }

    function resize(data,fileName,dimensions,doneCallback){
        if(resizeNeeded(data,dimensions)){
            if (data.resize.width && !data.resize.height) {
                gm(fileName).resize(data.resize.width).write(fileName, doneCallback);
                grunt.log.writeln('Resizing file ' + fileName + ' to width ' + data.resize.width);
            } else if (!data.resize.width && data.resize.height) {
                gm(fileName).resize(null, data.resize.height).write(fileName, doneCallback);
                grunt.log.writeln('Resizing file ' + fileName + ' to height ' + data.resize.height);
            } else if (data.resize.width && data.resize.height) {
                if (data.resize.force) {
                    gm(fileName).resize(data.resize.width, data.resize.height, "!").write(fileName, doneCallback);
                } else {
                    gm(fileName).resize(data.resize.width, data.resize.height).write(fileName, doneCallback);
                }
                grunt.log.writeln('Resizing file ' + fileName + ' to width ' + data.resize.width + ' height ' + data.resize.height + ' force: ' + data.resize.force);
            }
        }else{
            return false;
        }
    }

    function resizeNeeded(data,dimensions) {
        if (data.resize) {
            if (data.resize.width && !data.resize.height) {
                if (dimensions.width !== data.resize.width) {
                    return true;
                } else {
                    return false;
                }
            } else if (!data.resize.width && data.resize.height) {
                if (dimensions.height !== data.resize.height) {
                    return true;
                } else {
                    return false;
                }
            } else if (data.resize.width && data.resize.height) {
                if (dimensions.width !== data.resize.width && dimensions.height !== data.resize.height) {
                    return true;
                } else {
                    return false;
                }
            }
        }
    }

    function errorResize(err,fileName, needDimensions) {
        if (typeof err !== "undefined") {
            grunt.log.writeln("errorResize", err);
        }
        output += create(fileName, needDimensions);
        var index = pending.indexOf(fileName);
        if (index > -1) {
            pending.splice(index, 1);
        }
    }

    function setupVars(data){
        output = "";

        if (!data.prefix) {
            data.prefix = "";
        }

        if (data.sass){
            variableChar = "$";
        }

        prefix = data.prefix;

        if (!data.dest) {
            grunt.warn("dest needs to be set.");
            return false;
        }

        if (data.resize && data.resize.imageMagick) {
            gm = gm.subClass({imageMagick: true});
        }

    }

    function GruntTask(){
        var data = this.data,
            done = this.async(),
            cwd = './',
            filesToProcess = grunt.file.expand({cwd: cwd}, data.process);

        setupVars(data);

        if (!filesToProcess.length) {
            grunt.log.writeln("Nothing to process in " + data.process);
            done();
        } else {
            grunt.log.writeln("Processing  " + filesToProcess.length + " files...");
            for (var i = 0; i < filesToProcess.length; i++) {
                var fileName = filesToProcess[i];

                if (fs.lstatSync(fileName).isDirectory()) {
                    continue;
                }

                var dimensions = data.dimensions ? getDimensions(fileName) : null;

                if (data.resize) {
                    var doneCallback = function doneCallback(error) {
                        pending.push(fileName);
                        errorResize(error, fileName, dimensions);
                    };

                    if(!resize(data,fileName,dimensions,doneCallback)){
                        output += create(fileName, dimensions);
                    }

                } else {
                    output += create(fileName, dimensions);
                }
            }

            completeTimer = setInterval(function checkIfDone() {
                if (pending.length === 0) {
                    grunt.file.write(data.dest, output);
                    clearInterval(completeTimer);
                    done();
                }
            }, 1000);

        }
    }

    grunt.registerMultiTask('base64Less', 'Base64 encode files. Into less file format.', GruntTask);

    return {
        getSafeFileName: getSafeFileName,
        createVar: createVar,
        encode: encode,
        getDimensions: getDimensions,
        writeDimensions: writeDimensions,
        create: create,
        resize: resize,
        resizeNeeded: resizeNeeded,
        errorResize: errorResize,
        setupVars: setupVars,
        GruntTask: GruntTask
    };

};
