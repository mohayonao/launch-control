export default {
  parse(b0, b1, b2) {
    let value = Math.max(0, Math.min(b2, 127));
    let channel = Math.max(1, Math.min((b0 & 0x0f) - 7, 16));

    switch (b0 & 0xf0) {
      case 0x90: // note on
        if (0x09 <= b1 && b1 <= 0x0c && value === 127) {
          return { control: "pad", track: (b1 - 0x08), value, channel };
        }
        if (0x19 <= b1 && b1 <= 0x1c) {
          return { control: "pad", track: (b1 - 0x14), value, channel };
        }
        break;
      case 0xb0: // control change
        if (0x15 <= b1 && b1 <= 0x1c) {
          return { control: "knob1", track: (b1 - 0x14), value, channel };
        }
        if (0x29 <= b1 && b1 <= 0x30) {
          return { control: "knob2", track: (b1 - 0x28), value, channel };
        }
        break;
    }

    return null;
  },
};
