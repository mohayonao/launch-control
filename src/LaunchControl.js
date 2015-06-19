import xtend from "xtend";

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

      this._onmidimessage = (e) => {
        let msg = parseMessage(e.data[0], e.data[1], e.data[2]);

        if (msg === null) {
          return;
        }

        this.emit("message", xtend({ type: "message", deviceName: this.deviceName }, msg));
      };
    }
  };
}

export default {
  extends: _extends,
  parseMessage,
};
