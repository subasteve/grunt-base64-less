# grunt-base64-less

> A grunt task to base 64 encode files into less format.

## Getting Started
This plugin requires Grunt `~0.4.5`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-base64-less --save-dev
```

One the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-base64-less');
```

## The "base64Less" task

### Overview
In your project's Gruntfile, add a section named `base64Less` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  base64Less: {
    your_target: {
      // Target-specific file lists and/or options go here.
      process: [
        'wildcard/*'
      ],
      dest: "output.file",
      prefix: "font_",
      dimensions: false, //[Optional] Obtain dimensions and add vars in less
      resize: { //[Optional] Resize images
      	imageMagick: true, //[Optional] defaults to GraphicsMagick if not set
      	width: 100, //Use width alone to change width while keeping aspect ratio
      	height: 100, //Use height alone to change height while keeping aspect ratio
      	force: true //[Optional] Forces aspect ratio change
      }
    }
  }
})
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
0.2.4: Depends fixes
0.2.3: Bug fix  
0.2.2: Bug fix  
0.2.1: Bug fix  
0.2.0: Bug fixes, cleaned up  
0.1.2: Add image resizing   
0.1.11: Fix version  
0.1.1: Dimensions output added   
0.1.0: Initial release
