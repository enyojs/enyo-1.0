# Enyo Compress

Enyo Compress is a [NodeJS](http://www.nodejs.org) application that uses [UglifyJS](https://github.com/mishoo/UglifyJS) to compress enyo applications for better speed and loadtimes on device.

h2. Preparation

* Grab Node v0.4+
	* *IMPORTANT*: Node v0.2.x has many bugs and memory problems with copying files, so a version check is enforced.
	* See [Node site](http://nodejs.org/#download) or grab from your respective software repositories

h2. Usage

	node enyo-compress.js [ flag ]* sourceDir

Flags:

* -h | --help | -?: Print this message and exit
* -v | --verbose: Print more information, such as dependency loading steps and compression steps
* -o | --output `NAME`: Name of output directory, defaults to 'build'
* -s | --stats: Print compression statistics
* -i | --inplace: Put output files into source folder
* -d | --delete: Delete source files after compression when running in-place
* -u | --use: `PATH`: Use supplied depends file instead of one found in sourceDir
* --overwrite-depends: Force an overwriting of depends.js
* --make-enyo: Build the Enyo framework, slightly different format from apps.
* --no-colors: Disable color output, good for logging

h2. What is Built

* Only dependencies inside the `<target>` directory will be built.
* Dependencies outside the `<target>` directory will be reported at the end of the process.
* If you do not make an inplace build, a `BUILD` folder will be made that contains a copy of your app, and that will be compressed.
* This allows for easier switching until you feel like everything works in the built version.
* An output depends.js file is either placed in `BUILD/depends.js`, or `<sourceDir>/built-depends.js` depending on options specified.
* Javascript files that fail to build should be checked for errors at the indicated line.

h2. Caveats

* Multi window apps must build their windows separately. See *Examples* below
* Dependancies loaded multiple times are only warnings, and they are not filtered from the built code.
* *DO NOT* put code or variable definitions into `depends.js`, as it will not be preserved by the builder.
	* Put this kind of stuff either in the app itself (preferred), or in `index.html`.

h2. Examples

* Simple Application
	* `node enyo-compress application`
		* Generates a `build` folder with the compressed application inside, ready for packaging

* Inplace Compression
	* `node enyo-compress application --inplace`
		* Generates the compressed files in the same directory as the source (`application`) without removing source files, and generates a `built-depends.js` file which can be loaded with `enyo.depends("application/built")`.
		* The `--delete` flag will remove the source files if desired
		* The `--overwrite-depends` flag will overwrite the source `depends.js` file to point to the compressed files instead.

* Multi-window Applications
	* Multi-window applications can be built in several ways. This sequence of steps is not mandatory, but should work in most cases.
		* `node enyo-compress application --output build --no-delete` to build the main application
		* `node enyo-compress build/otherWindow --inplace --overwrite-depends --delete` for each window that needs to be compressed.
	* This creates a `build` folder with each window compressed inplace, so as not to overwrite the folder each time.
	* The `build` folder then is the only folder that needs to be packaged, as all windows are inside of it.

* **Advanced:** Build the framework
	* `node enyo-compress /path/to/enyo/source --make-enyo -o /path/to/enyo/build`
		* The enyo framework is built using this tool with the addition of the `--make-enyo` flag.
		* There are subtle differences between building an application, and building the framework:
			* The output of an enyo framework build is slightly different.
			* The enyo builder inserts macroized path definitions when compressing enyo, as well as prepending the enyo depedency loader.
			* The output of the build will also be named `enyo-build.js` and `enyo.build.css` for javascript and css built files.
			* There is no `depends.js` file generated for the framework builds; the framework bootstraps itself.
