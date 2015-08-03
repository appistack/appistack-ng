## Appistack Angular

A template for frontend web development with GulpJS, which includes:

- Tasks for JS/JSHint, Less, Image compression, Web Components
- Concatenation & Minification of JS, CSS, and your **Web Components**
- Includes Polymer's core-elements & paper-elements, using vulcanize
- Error handling that doesn't break `gulp watch`
- Nice gulp-notify configuration, with different sounds for success & failure
- Compiles Angular Templates into the $templateCache, which makes your Angular App super snappy.

## Getting Started

1. `npm install -g bower gulp`
1. `npm install`
1. `bower install`
1. `gulp` to build
  - `gulp clean` to clean dist folder
  - `export NODE_ENV=production && gulp` to build using production values set in `config.json`
1. `gulp watch` to set up a filechange watch
1. `gulp webserver` to run the gulp-webserver to serve static files
1. Connect to [http://localhost:8000](http://localhost:8000)

Also, note that in config.json, you can set `ng_mocks = false` if you do not want to use the API mocks in `app/mocks.js`.

## Configuring for Divshot

1. Login to the Divshot Web Interface and create a new app.
1. Download the Divshot CLI with `npm install -g divshot-cli`.
1. Login to the Divshot CLI with `divshot login`
1. Configure Divshot in `divshot.json`.  You only need to change the name to match the app you created.
1. Configure these settings in `config.json` for your production environment.
  - Set `api_protocol` to `https` if you're using Heroku.
  - Set `api_url` to the location of your API on Heroku.
  - Set `build folder` to match the `root` configured in `divshot.json`.
  - Set `assets_url` to the root location of your static assets.
  - Configure `googleAnalytics` if you have set it up for your app.  Otherwise, remove this section.
  - Ensure `ng_mocks` is set to false, unless you want to use your $httpBackend mocks in production.
  
That's it - you're ready to deploy to Divshot!

## Deploying to Divshot

The app is hosted at [development.oscillate.divshot.io](http://development.oscillate.divshot.io).  Divshot is a
service to host completely static sites.

Deploy with the following:

1. `NODE_ENV=divshot gulp` to build app in ./divshot.
  - `NODE_ENV=production gulp` to build app with production configuration in `config.js`.
1. `divshot push` to push changes to your Divshot development environment.  
  - `divshot push production` to push to production.
  
## Configuring For Multiple Environments

Configuration for building your app is set in `config.json`.  Default configuration is specified in `common` and
configurations for each environment will override these defaults.  The `divshot` environment is used to deploy
to your Divshot development environment.

`api_protocol` - Used to specify http or https for you API.

`api_url` - The name of your web server, used in conjunction with `api_protocol` for the Angular ENV.apiUrl constant.

`assets_url` - The root location for your static assets.

  - If your hosting your static assets through Divshot, then this can just be your root url - E.G. `//appistack.com/`
  - If you have a more complicated configuration with S3 or host various types of static resources in different locations, then you'll need to replace this with your own implementation.

`app_js` - The relative location of your compiled `app.js`.  Default: `js/app.js`

`app_css` - The relative location of your compiled `app.css`.  Default: `js/app.css`
 
`app_components` - The relative location of your compiled web components.  Used if you're using Polymore components.  Default: `components/build.html`

`build_folder` - The location where gulp should build your webapp when you run `gulp`  

  - `gulp webserver` will serve files from `./dist`
  - `divshot deploy` is configured in `divshot.json` to upload files compiled in `./divshot`.  
  - This is so you can push updates to divshot without having to stop gulp. 

`ng_mocks` - Set to true if $httpBackend mocks should be enabled.  

  - When `ng_mocks` is set to true, `app/mocks.js` will be included.  Otherwise, it is completely omitted from `app.js`
   
`googleAnalytics` - contains your Google Analytics `trackingId` and `domainName`.  

  - If this section is not included, then the Google Analytics script will be omitted from the build.

## Running Unit Tests

Not yet configured.

## Running Integration Tests

1. Enable $httpBackend. Open config.js and ensure `"ng_mocks": true` for the webserver that selenium connects to.
  - Alternatively, you run your Appistack API server.
1. Install Protractor with `npm install -g protractor`
1. Setup Selenium (you'll need JDK) with `webdriver-manager update`
1. Start your selenium server `webdriver-manager start`
1. Run the tests with `protractor spec/conf.js`

## TODO

- config.js options for minification? don't compile source maps in dev either
  - this will save a ton of time on the JS task (source maps are 95% of js task time)
- add carousel showing appistack features
- API documentation
- google analytics account
- use <script> tags for vendor dependencies in production
  - continue to concat one app.js file in development?
  - or concat vendor.js and app.js, so sourcemaps still work, but gulp-change can be used

## License

[MIT License](http://dcunited001.mit-license.org)

## References

Articles I found useful in learning Angular/Webaudio/Canvas.

### Events - broadcasting, emitting and using $rootScope

- http://www.quora.com/Is-it-a-bad-practice-to-always-use-broadcast-on-on-the-rootScope-in-AngularJS
- https://groups.google.com/forum/#!topic/angular/WQyObwkK6vE

### Testing AngularJS

- http://quickleft.com/blog/angularjs-unit-testing-for-real-though
- https://ramonvictor.github.io/protractor/slides/#/49
- https://www.youtube.com/watch?v=aQipuiTcn3U

### Firebase

- [Firebase Simple Login is deprecated as of 10/3/14](https://www.firebase.com/docs/web/guide/user-auth.html)
- [Official AngularFire/SimpleLogin Example](https://www.firebase.com/docs/web/libraries/angular/quickstart.html)
- http://www.christopheresplin.com/single-page-app-architecture-connecting-to-firebase

### Web Audio API

- Audio Tag http://www.w3schools.com/tags/tag_audio.asp
- http://joshondesign.com/p/books/canvasdeepdive/chapter12.html
- https://developer.mozilla.org/en-US/docs/Web/HTML/Supported_media_formats#Browser_compatibility
- http://www.html5rocks.com/en/tutorials/webaudio/intro/
- http://middleearmedia.com/web-audio-api-audio-buffer/
- https://developer.apple.com/library/safari/documentation/audiovideo/conceptual/using_html5_audio_video/PlayingandSynthesizingSounds/PlayingandSynthesizingSounds.html

### Official Docs:

- [getting started](https://github.com/gulpjs/gulp/blob/master/docs/getting-started.md)
- [recipes](https://github.com/gulpjs/gulp/tree/master/docs/recipes)
- [docs readme](https://github.com/gulpjs/gulp/blob/master/docs/README.md#articles)

### Intro Blogs

- [markgoodyear's gulp guide](http://markgoodyear.com/2014/01/getting-started-with-gulp/)
- [Rome wasn't built with Gulp](http://www.adamlynch.com/rome-wasnt-built-with-gulp/#slide-0)
- http://travismaynard.com/writing/getting-started-with-gulp
- http://ilikekillnerds.com/2014/07/how-to-basic-tasks-in-gulp-js/
- http://blog.overzealous.com/post/74121048393/why-you-shouldnt-create-a-gulp-plugin-or-how-to-stop

### Error Handling Blogs

- [Error Handling in GulpJS](http://www.artandlogic.com/blog/2014/05/error-handling-in-gulp/)
- [Handle Errors While Using Gulp Watch](http://truongtx.me/2014/07/15/handle-errors-while-using-gulp-watch/)

### Vulcanize Web Components

- [gulp-vulcanize](https://www.npmjs.org/package/gulp-vulcanize)
- [vulcanize options](https://github.com/Polymer/grunt-vulcanize#options) (grunt & gulp plugins use same format)

### Gulp & Angular Templates

- https://www.npmjs.org/package/gulp-angular-templates
- https://www.npmjs.org/package/gulp-angular-templatecache

### Polymer/Angular SEO

- https://www.youtube.com/watch?v=inIIyR7hN8M&feature=youtu.be