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

## Examples

Online examples (using Web MIDI API)

- [dump messages from Launch Control](http://mohayonao.github.io/launch-control/examples/dump.html)
- [LED operation using knob controllers](http://mohayonao.github.io/launch-control/examples/led.html)
- [reset all LED](http://mohayonao.github.io/launch-control/examples/reset.html)

Run example with Node.js (using [node-midi](https://github.com/justinlatimer/node-midi))

```
node examples/dump.js
```

## API
### LaunchControl
- `constructor(deviceName: string = 'Launch Control')`

#### Class methods

- `requestDeviceNames(): Promise<{ inputs: string[], outputs: string[] }>`

#### Instance methods
_Also implements methods from the interface [@mohayonao/event-emitter](https://github.com/mohayonao/event-emitter)._

- `open(): Promise<[ input, output ]>`
- `close(): Promise<[ input, output ]>`
- `send(data: number[]): void`
- `led(track: number|string, color: number|string, [channel: number]): void`
  - `track` 0 - 7 or "all", "even", "odd"
  - `color` index or name (see below)

#### Events

- `message`
  - `dataType: string`
    - knob1
    - knob2
    - pad
    - cursor
  - `value: number` 0 - 127
  - `track: number` 0 - 7 ( knob1, knob2, pad )
  - `direction: string` "left", "right", "up" or "down" ( cursor )
  - `channel: number` 0 - 15
  - `deviceName: string`

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
  console.log("dataType: " + e.dataType);
  console.log("track   : " + e.track);
  console.log("value   : " + e.value);
  console.log("channel : " + e.channel);
});
```

## License
MIT
