import xtend from "xtend";

const PAD = [ 0x09, 0x0a, 0x0b, 0x0c, 0x19, 0x1a, 0x1b, 0x1c ];
const KNOB1 = [ 0x15, 0x16, 0x17, 0x18, 0x19, 0x1a, 0x1b, 0x1c ];
const KNOB2 = [ 0x29, 0x2a, 0x2b, 0x2c, 0x2d, 0x2e, 0x2f, 0x30 ];
const COLOR_NAMES = {
  "off": 0,
  "dark red": 1,
  "red": 2,
  "light red": 3,
  "dark green": 4,
  "dark amber": 5,
  "green": 8,
  "amber": 10,
  "light green": 12,
  "light amber": 15,
};
const TRACK_SELECTOR = {
  all: () => true,
  even: (_, i) => i % 2 === 0,
  odd: (_, i) => i % 2 === 1,
};

function parseMessage(st, d1, d2) {
  let messageType = st & 0xf0;
  let value = Math.max(0, Math.min(d2, 127));
  let channel = Math.max(0, Math.min(st & 0x0f, 15));
  let track;

  if (messageType === 0x90) { // note on
    track = PAD.indexOf(d1);
    if (track !== -1) {
      return { control: "pad", track, value, channel };
    }
  }

  if (messageType === 0xb0) { // control change
    track = KNOB1.indexOf(d1);
    if (track !== -1) {
      return { control: "knob1", track, value, channel };
    }

    track = KNOB2.indexOf(d1);
    if (track !== -1) {
      return { control: "knob2", track, value, channel };
    }
  }

  return null;
}

function buildLedData(track, color, channel) {
  if (typeof color === "string") {
    color = COLOR_NAMES[color];
  }
  color = (color|0) % 16;

  let st = 0x90 + ((channel|0) % 16);
  let d2 = ((color & 0x0c) << 2) + 0x0c + (color & 0x03);

  if (TRACK_SELECTOR.hasOwnProperty(track)) {
    return PAD.filter(TRACK_SELECTOR[track]).map(d1 => [ st, d1, d2 ]);
  }

  if (/^[-o]+$/.test(track)) {
    let data = [];

    for (let i = 0; i < 8; i++) {
      if (track[i % track.length] === "o") {
        data.push([ st, PAD[i], d2 ]);
      }
    }

    return data;
  }

  let d1 = PAD[(track|0) % 8];

  return [ [ st, d1, d2 ] ];
}

function _extends(MIDIDevice) {
  return class LaunchControl extends MIDIDevice {
    constructor(deviceName = "Launch Control") {
      super(deviceName);

      this._channel = 8;
      this._onmidimessage = (e) => {
        let msg = parseMessage(e.data[0], e.data[1], e.data[2]);

        if (msg === null) {
          return;
        }

        this._channel = msg.channel;
        this.emit("message", xtend({ type: "message", deviceName: this.deviceName }, msg));
      };
    }

    led(track, color, channel = this._channel) {
      buildLedData(track, color, channel).forEach((data) => { this.send(data); });
    }
  };
}

export default {
  extends: _extends,
  parseMessage,
  buildLedData,
};
