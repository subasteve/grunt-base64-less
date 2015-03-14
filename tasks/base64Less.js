/*
 * grunt-base64-less
 * https://github.com/subasteve/grunt-base64-less
 *
 * Copyright (c) 2014 Subasteve
 * Licensed under the Apache 2.0 licenses.
 */

'use strict';

module.exports = function(grunt) {
  
  var mime = require('mime'),
  fs = require('fs'),
  sizer = require('image-size'),
  gm = require('gm'),
  errorResize = function errorResize(err) {
  	if(!err){
		grunt.log.writeln("errorResize",err);
	}
  };

  grunt.registerMultiTask('base64Less', 'Base64 encode files. Into less file format.', function() {
    var data = this.data,
    done = this.async(),
    cwd = './',
    filesToProcess = grunt.file.expand({cwd: cwd},data.process),
    output = "";

    if(!data.prefix){
	data.prefix = "";
    }

    if(!data.dest){
	grunt.warn("dest needs to be set.");
        return false;
    }
    
    if(data.resize.imageMagick){
    	    gm = gm.subClass({ imageMagick: true });
    }

    if(!filesToProcess.length){
	grunt.log.writeln("Nothing to process in "+data.process);
	done();
    }else{
	grunt.log.writeln("Processing  "+filesToProcess.length+" files...");
	for(var i = 0; i < filesToProcess.length; i++){
		if(data.resize){
			var dimensions = sizer(filesToProcess[i]);
			if(data.resize.width && !data.resize.height){
				if(dimensions.width !== data.resize.width){
					gm(filesToProcess[i]).resize(data.resize.width).write(filesToProcess[i],errorResize);
					grunt.log.writeln('Resizing file '+filesToProcess[i]+' to width '+data.resize.width);
				}
			}else if(!data.resize.width && data.resize.height){
				if(dimensions.height !== data.resize.height){
					gm(filesToProcess[i]).resize(null,data.resize.height).write(filesToProcess[i],errorResize);
					grunt.log.writeln('Resizing file '+filesToProcess[i]+' to height '+data.resize.height);
				}
			}else if(data.resize.width && data.resize.height){
				if(dimensions.width !== data.resize.width && dimensions.height !== data.resize.height){
					if(data.resize.force){
						gm(filesToProcess[i]).resize(data.resize.width,data.resize.height,"!").write(filesToProcess[i],errorResize);
					}else{
						gm(filesToProcess[i]).resize(data.resize.width,data.resize.height).write(filesToProcess[i],errorResize);
					}
					grunt.log.writeln('Resizing file '+filesToProcess[i]+' to width '+data.resize.width+' height '+data.resize.height+' force: '+data.resize.force);
				}
			}
		}
		var lessFileName = filesToProcess[i].substring(filesToProcess[i].lastIndexOf("/")+1),
		lessSafeFileName = lessFileName.replace(".","_"),
		contents = fs.readFileSync(filesToProcess[i]),
		base64Contents = contents.toString('base64');
		
		output += "@"+data.prefix+lessSafeFileName+":\"data:"+mime.lookup(filesToProcess[i])+";base64,"+base64Contents+"\";\n";
	
		if(data.dimensions){
			var dimensions1 = sizer(filesToProcess[i]);
			output += "@"+data.prefix+lessSafeFileName+"_width: "+dimensions1.width+"px;\n";
			output += "@"+data.prefix+lessSafeFileName+"_height: "+dimensions1.height+"px;\n";	
		}
		grunt.log.writeln('Base64 encoded "' + filesToProcess[i] + '" to '+data.prefix+lessSafeFileName+' less entry.');    
	}
	grunt.file.write(data.dest, output);

    }
  });

};
