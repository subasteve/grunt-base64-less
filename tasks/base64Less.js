/*
 * grunt-base64-less
 * https://github.com/subasteve/grunt-base64-less
 *
 * Copyright (c) 2014 Subasteve
 * Licensed under the Apache 2.0 licenses.
 */

//'use strict';

module.exports = function(grunt) {
  
  var mime = require('mime'),
  fs = require('fs'),
  sizer = require('image-size'),
  gm = require('gm'),
  output = "",
  pending = [],
  completeTimer = null;

  function encode(prefix,lessSafeFileName,fileName){
   	var contents = fs.readFileSync(fileName),
	    base64Contents = contents.toString('base64');
	grunt.log.writeln('Base64 encoded "' + fileName + '" to '+prefix+lessSafeFileName+' less entry.');	
	return "@"+prefix+lessSafeFileName+":\"data:"+mime.lookup(fileName)+";base64,"+base64Contents+"\";\n";
  }

  function writeDimensions(prefix,lessSafeFileName,fileName){
    	var dimensions1 = sizer(fileName);
	return "@"+prefix+lessSafeFileName+"_width: "+dimensions1.width+"px;\n@"+prefix+lessSafeFileName+"_height: "+dimensions1.height+"px;\n";
  }

  function create(prefix,lessSafeFileName,fileName,needDimensions){
  	return (!needDimensions) ? encode(prefix,lessSafeFileName,fileName) : encode(prefix,lessSafeFileName,fileName)+writeDimensions(prefix,lessSafeFileName,fileName);
  }


  function errorResize(err,prefix,lessSafeFileName,fileName,needDimensions) {
  	if(typeof err !== "undefined"){
		grunt.log.writeln("errorResize",err);
	}
	output += create(prefix,lessSafeFileName,fileName,needDimensions);
  	var index = pending.indexOf(lessSafeFileName);
  	if(index > -1){
		pending.splice(index, 1);
	}
  }

  grunt.registerMultiTask('base64Less', 'Base64 encode files. Into less file format.', function() {
    var data = this.data,
    done = this.async(),
    cwd = './',
    filesToProcess = grunt.file.expand({cwd: cwd},data.process);
    
    output = "";

    if(!data.prefix){
	data.prefix = "";
    }

    if(!data.dest){
	grunt.warn("dest needs to be set.");
        return false;
    }
    
    if(data.resize && data.resize.imageMagick){
    	    gm = gm.subClass({ imageMagick: true });
    }

    if(!filesToProcess.length){
	grunt.log.writeln("Nothing to process in "+data.process);
	done();
    }else{
	grunt.log.writeln("Processing  "+filesToProcess.length+" files...");
	for(var i = 0; i < filesToProcess.length; i++){
		var lessFileName = filesToProcess[i].substring(filesToProcess[i].lastIndexOf("/")+1),
		    lessSafeFileName = lessFileName.replace(".","_"),
		    fileName = filesToProcess[i];
		if(data.resize){
			var dimensions = sizer(fileName);
			function doneCallback(error){
				pending.push(lessSafeFileName);
				errorResize(error,data.prefix,lessSafeFileName,fileName,data.dimensions);
			}
			if(data.resize.width && !data.resize.height){
				if(dimensions.width !== data.resize.width){
					gm(fileName).resize(data.resize.width).write(fileName,doneCallback);
					grunt.log.writeln('Resizing file '+fileName+' to width '+data.resize.width);
				}else{
					output += create(data.prefix,lessSafeFileName,fileName,data.dimensions);
				}
			}else if(!data.resize.width && data.resize.height){
				if(dimensions.height !== data.resize.height){
					gm(fileName).resize(null,data.resize.height).write(fileName,doneCallback);
					grunt.log.writeln('Resizing file '+fileName+' to height '+data.resize.height);
				}else{
					output += create(data.prefix,lessSafeFileName,fileName,data.dimensions);
				}
			}else if(data.resize.width && data.resize.height){
				if(dimensions.width !== data.resize.width && dimensions.height !== data.resize.height){
					if(data.resize.force){
						gm(fileName).resize(data.resize.width,data.resize.height,"!").write(fileName,doneCallback);
					}else{
						gm(fileName).resize(data.resize.width,data.resize.height).write(fileName,doneCallback);
					}
					grunt.log.writeln('Resizing file '+fileName+' to width '+data.resize.width+' height '+data.resize.height+' force: '+data.resize.force);
				}else{
					output += create(data.prefix,lessSafeFileName,fileName,data.dimensions);
				}
			}
		}else{
			output += create(data.prefix,lessSafeFileName,fileName,data.dimensions);
		}
	}
	
	completeTimer = setInterval(function checkIfDone(){
		if(pending.length === 0){
			grunt.file.write(data.dest, output);	
			clearInterval(completeTimer);
		}
	}, 1000);

    }
  });

};
