# LAUNCH CONTROL
[![Build Status](http://img.shields.io/travis/mohayonao/launch-control.svg?style=flat-square)](https://travis-ci.org/mohayonao/launch-control)
[![NPM Version](http://img.shields.io/npm/v/@mohayonao/launch-control.svg?style=flat-square)](https://www.npmjs.org/package/@mohayonao/launch-control)
[![License](http://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square)](http://mohayonao.mit-license.org/)

> JavaScript utility for novation LAUNCH CONTROL

[![Launch Control](http://otononaru.appspot.com/cdn/git-hub/launch-control/launch-control.png)](http://www.h-resolution.com/novation/launchcontrol.php)

## Installation

Node.js

```sh
npm install @mohayonao/launch-control
```

Browser

- [launch-control.js](http://mohayonao.github.io/launch-control/build/launch-control.js)

## API
### LaunchControl
- `constructor(deviceName: string = 'Launch Control')`

#### Instance methods
_Also implements methods from the interface [EventEmitter](https://nodejs.org/api/events.html)._

- `open(): Promise<[ input, output ]>`
- `close(): Promise<[ input, output ]>`
- `led(track: number|string, color: number|string, [channel: number]): void`
  - `track` 0 - 7 or "all"
  - `color` = `(greenVelocity << 2) + redVelocity` or see below

#### Events

- `message`
  - `control: string` "knob1", "knob2" or "pad"
  - `deviceName: string`
  - `track: number` 0 - 7
  - `value: number` 0 - 127
  - `channel: number` 8 - 15

#### Color Code
| color name  | color index |
|-------------|------------:|
| off         | 0           |
| dark red    | 1           |
| red         | 2           |
| light red   | 3           |
| dark green  | 4           |
| dark amber  | 5           |
| green       | 8           |
| amber       | 10          |
| light green | 12          |
| light amber | 15          |

## Usage

Node.js

```js
var LaunchControl = require("@mohayonao/launch-control");
```

Browser
```html
<script src="/path/to/launch-control.js"></script>
```

Common

```js
var ctrl = new LaunchControl();

ctrl.open().then(function() {
  ctrl.led("all", "amber");
});

ctrl.on("message", function(e) {
  console.log("control: " + e.control);
  console.log("track  : " + e.track);
  console.log("value  : " + e.value);
  console.log("channel: " + e.channel);
});
```

## License
MIT
