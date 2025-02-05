
# twig-loader
Webpack loader for compiling Twig.js templates. This loader will allow you to require Twig.js views to your code.

This is a fork of [@jfrk/twig-loader](https://github.com/jfrk/twig-loader) to support using Drupal's [Single Directory Components](https://www.drupal.org/docs/develop/theming-drupal/using-single-directory-components) in [Twig.js](https://github.com/twigjs/twig.js). 

## Installation

`npm i @mtbdata711/twig-loader`

## Usage

[Documentation: Using loaders](http://webpack.github.io/docs/using-loaders.html?branch=master)

``` javascript

module.exports = {
    //...

    module: {
        rules: [
            {
                test: /\.twig$/,
                loader: "twig-loader",
                options: {
                    // See options section below
                },
            }
        ]
    },

    node: {
        fs: "empty" // avoids error messages
    }
};
```

### Options

- `extender`: optional; the full path to a module which exports a `function(Twig)`
  which extends Twig (such as adding filters and functions). Must use `export default` instead of `module.exports`.
  Example: `__dirname + "/src/extendTwig.js"`
- `paths`: optional; an array of absolute paths that contain Twig templates. When this option is included, paths that doesn’t begin with a `.` or `/` inside tags like `{% include %}` and `{% extends %}` will be considered relative to one of these paths instead of the file. This mimics the PHP implementation of Twig.
- `twigOptions`: optional; a map of options to be passed through to Twig.
  Example: `{autoescape: true}`
 - `sdc` - optional; object of namespaces and paths to SDC namespaces. Example: `{design_system: path.resolve(__dirname, './components')}`

## Loading templates

```twig
{# File: dialog.html.twig #}
<p>{{title}}</p>
```

```javascript
// File: app.js
var template = require("./dialog.html.twig");
// => returns pre-compiled template as a function and automatically includes Twig.js to your project

var html = template({title: 'dialog title'});
// => Render the view with the given context

```

When you extend another view, it will also be added as a dependency. All twig functions that refer to additional templates are supported: import, include, extends & embed.
