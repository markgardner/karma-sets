# karma-sets
> Multi-Suite runner plugin for Karma

## Installation

The easiest way is to keep `karma-sets` as a devDependency in your `package.json`.
```json
{
  "devDependencies": {
    "karma": "^0.12.31",
    "karma-sets": "^0.1.0"
  }
}
```

You can simple do it by:
```bash
npm install karma-sets --save-dev
```

## Configuration
```js
// karma.conf.js
module.exports = function(config) {
  config.set({
    frameworks: ['mocha', 'sets'],
    sets: {
      NamedSet1: [
        'assets/js/Set1/*.js',
        'assets/js/Set1/test/*.js'
      ],
      NamedSet2: [
        'assets/js/Set2/*.js',
        'assets/js/Set2/test/*.js'
      ]
    }
  });
};
```

----