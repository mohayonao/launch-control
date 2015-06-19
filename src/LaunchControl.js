import xtend from "xtend";

const TRACK_TO_NOTE = [ 0x09, 0x0a, 0x0b, 0x0c, 0x19, 0x1a, 0x1b, 0x1c ];
const COLORS = {
  off: 0,
  "dark red": 1,
  red: 2,
  "light red": 3,
  "dark green": 4,
  "dark amber": 5,
  green: 8,
  amber: 10,
  "light green": 12,
  "light amber": 15,
};

function parseMessage(b0, b1, b2) {
  let value = Math.max(0, Math.min(b2, 127));
  let channel = Math.max(0, Math.min(b0 & 0x0f, 15));

  switch (b0 & 0xf0) {
    case 0x90: // note on
      if (0x09 <= b1 && b1 <= 0x0c && value === 127) {
        return { control: "pad", track: (b1 - 0x09), value, channel };
      }
      if (0x19 <= b1 && b1 <= 0x1c) {
        return { control: "pad", track: (b1 - 0x15), value, channel };
      }
      break;
    case 0xb0: // control change
      if (0x15 <= b1 && b1 <= 0x1c) {
        return { control: "knob1", track: (b1 - 0x15), value, channel };
      }
      if (0x29 <= b1 && b1 <= 0x30) {
        return { control: "knob2", track: (b1 - 0x29), value, channel };
      }
      break;
  }

  return null;
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
      if (typeof color === "string") {
        color = COLORS[color];
      }
      color = (color|0) % 16;

      let b0 = 0x90 + (channel % 16);
      let b2 = ((color & 0x0c) << 2) + 0x0c + (color & 0x03);

      if (track === "all") {
        TRACK_TO_NOTE.forEach((b1) => {
          this.send([ b0, b1, b2 ]);
        });
      } else {
        let b1 = TRACK_TO_NOTE[track % TRACK_TO_NOTE.length];
        this.send([ b0, b1, b2 ]);
      }
    }
  };
}

export default {
  extends: _extends,
  parseMessage,
};
