'use strict';

var gruntMock = {
    registerMultiTask: function (){

    },
    log: {
        writeln: function (log){

        }
    }
};

var validBase64Less = "@img-us_png:\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACYAAAAUCAIAAABu7dhfAAAB+0lEQVR42sWWSS8DYRjHX7vYHewRRIilq9bFVAQNYokixBo73bRTqlVtUbGXiERiJ5QKRQ8+gIOTgzg4ODn5IPxrnCRO04zJ/zC/yeR9nt/7zExLQvlacfMiyVOKFAsRIl0ITyNpWQby6ucjxfrgQrX0GwvqHLHFhoM46iFCxDIkIF/VrNtLokw1Q1vxxYaEEmPT2G5KqVnev5lMmXGdQVmXM7Vs6l67+m7bYhkCg2gJrZxzx0gN+XVztSPbwNHZC2CW3Nao2WEQirjz5e3jk/VBwoVj+qXrMIF20OqCEwroFq9wsdt0nFlpjSrS00vXwFZ6Hw0dp8kfk2Us47PEwIxrt6F8jVCxgKWBE6s3aCKnegaFGQwXaHGnt9PyNmxnGZ8lveLBRIft57BEJWgFFqj6LKcZFdPoY3zlBtg+fghL/2wsekemNrxYF5YdE0dA8/pdUKEalijMIFxx4hK0PgkVLOOzNDnvsJzacQlLvDOTzlvgkM2FWaIS6gF7TCd4TzwNutc2mmV+LFEVlryG+U7jEYOwzK6y/7L0z8ZieIZlD1ZUOdyJ1CSk8bAAB6xn6eUWzJJBtJJbM+umep/LeliG8AWj4iI1jz8iFCkRnEikmr/QK/NHyU/OD4J5chyCp5bj/MfG4gvEcQi+sxznPzYWv5kch+CfAcf5Ap97Cqiq6b86AAAAAElFTkSuQmCC\";\n";
var validLessDimensions = "@img-us_png_width:38px;\n@img-us_png_height:20px;\n";

var Base64Less = require("../tasks/base64Less.js");
var base64Less = new Base64Less(gruntMock);
base64Less.setupVars({
    prefix: "img-",
    dest: "dist"
});

var textImg = "./test/img/us.png";
var dimensions = base64Less.getDimensions(textImg);

exports.testEncode = function(test) {
    test.equal(base64Less.encode(textImg).data, validBase64Less);
    test.done();
};

exports.testGetSafeFileName = function(test) {
    test.equal(base64Less.getSafeFileName("us.png"), "us_png");
    test.done();
};

exports.testGetSafeFileName2 = function(test) {
    test.equal(base64Less.getSafeFileName(textImg), "us_png");
    test.done();
};

exports.testCreateVar = function(test) {
    test.equal(base64Less.createVar("us_png","width","38px"),"@img-us_png_width:38px;\n");
    test.done();
};

exports.testCreateVar2 = function(test) {
    test.equal(base64Less.createVar("us_png","width"),"@img-us_png_width:\"\";\n");
    test.done();
};

exports.testCreateVar3 = function(test) {
    test.equal(base64Less.createVar("us_png"),"@img-us_png:\"\";\n");
    test.done();
};

exports.testCreateVarSass = function(test) {
    var base64Less2 = new Base64Less(gruntMock);
    base64Less2.setupVars({
        prefix: "img-",
        dest: "dist",
        sass:true
    });
    test.equal(base64Less2.createVar("us_png","width","38px"),"$img-us_png_width: 38px;\n");
    test.done();
};

exports.testCreateVarNoPrefix = function(test) {
    var base64Less2 = new Base64Less(gruntMock);
    base64Less2.setupVars({
        dest: "dist"
    });
    test.equal(base64Less2.createVar("us_png","width","38px"),"@us_png_width:38px;\n");
    test.done();
};

exports.testGetDimensions = function(test) {
    test.notEqual(dimensions, undefined);
    test.done();
};

exports.testGetDimensionsWidth = function(test) {
    test.equal(dimensions.width, 38);
    test.done();
};

exports.testGetDimensionsHeight = function(test) {
    test.equal(dimensions.height, 20);
    test.done();
};

exports.testWriteDimensions = function(test) {
    test.equal(base64Less.writeDimensions("us_png",dimensions), validLessDimensions);
    test.done();
};

exports.testCreateWithoutDimensions = function(test) {
    test.equal(base64Less.create(textImg), validBase64Less);
    test.done();
};

exports.testCreateWithDimensions = function(test) {
    test.equal(base64Less.create(textImg,dimensions), validBase64Less + validLessDimensions);
    test.done();
};

exports.testCreateWithDimensions = function(test) {
    test.equal(base64Less.create(textImg,dimensions), validBase64Less + validLessDimensions);
    test.done();
};