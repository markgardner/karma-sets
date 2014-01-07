# karma-sets
> Multi-Suite runner plugin for Karma

## Installation

The easiest way is to keep `karma-sets` as a devDependency in your `package.json`.
```json
{
  "devDependencies": {
    "karma": "~0.10",
    "karma-sets": "~0.0.1"
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
    frameworks: ['mocha', 'sets']
  });
};
```

----