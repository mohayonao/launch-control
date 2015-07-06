import assert from "power-assert";
import sinon from "sinon";
import TestMIDIDevice from "@mohayonao/midi-device/test";
import LaunchControl from "../src/LaunchControl";

describe("LaunchControl", () => {
  describe(".extends(MIDIDevice: class): class extends MIDIDevice", () => {
    it("constructor(deviceName: string)", () => {
      let TestLaunchControl = LaunchControl.extends(TestMIDIDevice);
      let launchControl = new TestLaunchControl();

      assert(launchControl instanceof TestLaunchControl);
      assert(launchControl instanceof TestMIDIDevice);
      assert(launchControl.deviceName === "Launch Control");
    });
    it("event: 'message'", () => {
      let TestLaunchControl = LaunchControl.extends(TestMIDIDevice);
      let launchControl = new TestLaunchControl("TestDevice1");
      let onmessage = sinon.spy();

      launchControl.on("message", onmessage);

      return launchControl.open().then(([ input ]) => {
        input.recv([ 0x98, 0x09, 0x7f ]);

        assert(onmessage.calledOnce);

        let msg = onmessage.args[0][0];

        assert(msg.type === "message");
        assert(msg.deviceName === "TestDevice1");
        assert(msg.dataType === "pad");
        assert(msg.track === 0);
        assert(msg.value === 127);
        assert(msg.channel === 8);
        onmessage.reset();

        input.recv([ 0x00, 0x00, 0x00 ]);
        assert(!onmessage.called);
      });
    });
    it("#led(track: number, color: number, [channel: number]): void", () => {
      let TestLaunchControl = LaunchControl.extends(TestMIDIDevice);
      let launchControl = new TestLaunchControl("TestDevice1");

      return launchControl.open().then((ports) => {
        let output = ports[1];

        output.onmessage = sinon.spy();

        launchControl.led(0, "red");
        assert(output.onmessage.calledOnce);
        assert.deepEqual(output.onmessage.args[0][0], [ 0x98, 0x09, 0x0e ]);
        output.onmessage.reset();

        launchControl.led("o------o", 13, 9);
        assert(output.onmessage.callCount === 2);
        assert.deepEqual(output.onmessage.args[0][0], [ 0x99, 0x09, 0x3d ]);
        assert.deepEqual(output.onmessage.args[1][0], [ 0x99, 0x1c, 0x3d ]);
      });
    });
  });
  describe(".buildLedData(track: number, color: number, channel: number): number[][]", () => {
    it("works", () => {
      assert.deepEqual(LaunchControl.buildLedData(0, 0, 0), [ [ 0x90, 0x09, 0x0c ] ]);
      assert.deepEqual(LaunchControl.buildLedData(0, 1, 0), [ [ 0x90, 0x09, 0x0d ] ]);
      assert.deepEqual(LaunchControl.buildLedData(1, 2, 0), [ [ 0x90, 0x0a, 0x0e ] ]);
      assert.deepEqual(LaunchControl.buildLedData(1, 3, 0), [ [ 0x90, 0x0a, 0x0f ] ]);
      assert.deepEqual(LaunchControl.buildLedData(2, 4, 0), [ [ 0x90, 0x0b, 0x1c ] ]);
      assert.deepEqual(LaunchControl.buildLedData(2, 5, 0), [ [ 0x90, 0x0b, 0x1d ] ]);
      assert.deepEqual(LaunchControl.buildLedData(3, 6, 0), [ [ 0x90, 0x0c, 0x1e ] ]);
      assert.deepEqual(LaunchControl.buildLedData(3, 7, 0), [ [ 0x90, 0x0c, 0x1f ] ]);
      assert.deepEqual(LaunchControl.buildLedData(4, 8, 8), [ [ 0x98, 0x19, 0x2c ] ]);
      assert.deepEqual(LaunchControl.buildLedData(4, 9, 8), [ [ 0x98, 0x19, 0x2d ] ]);
      assert.deepEqual(LaunchControl.buildLedData(5, 10, 8), [ [ 0x98, 0x1a, 0x2e ] ]);
      assert.deepEqual(LaunchControl.buildLedData(5, 11, 8), [ [ 0x98, 0x1a, 0x2f ] ]);
      assert.deepEqual(LaunchControl.buildLedData(6, 12, 8), [ [ 0x98, 0x1b, 0x3c ] ]);
      assert.deepEqual(LaunchControl.buildLedData(6, 13, 8), [ [ 0x98, 0x1b, 0x3d ] ]);
      assert.deepEqual(LaunchControl.buildLedData(7, 14, 8), [ [ 0x98, 0x1c, 0x3e ] ]);
      assert.deepEqual(LaunchControl.buildLedData(7, 15, 8), [ [ 0x98, 0x1c, 0x3f ] ]);

      assert.deepEqual(LaunchControl.buildLedData(0, "off", 0), [ [ 0x90, 0x09, 0x0c ] ]);
      assert.deepEqual(LaunchControl.buildLedData(0, "dark red", 0), [ [ 0x90, 0x09, 0x0d ] ]);
      assert.deepEqual(LaunchControl.buildLedData(0, "red", 0), [ [ 0x90, 0x09, 0x0e ] ]);
      assert.deepEqual(LaunchControl.buildLedData(0, "light red", 0), [ [ 0x90, 0x09, 0x0f ] ]);
      assert.deepEqual(LaunchControl.buildLedData(0, "dark green", 0), [ [ 0x90, 0x09, 0x1c ] ]);
      assert.deepEqual(LaunchControl.buildLedData(0, "dark amber", 0), [ [ 0x90, 0x09, 0x1d ] ]);
      assert.deepEqual(LaunchControl.buildLedData(0, "green", 0), [ [ 0x90, 0x09, 0x2c ] ]);
      assert.deepEqual(LaunchControl.buildLedData(0, "amber", 0), [ [ 0x90, 0x09, 0x2e ] ]);
      assert.deepEqual(LaunchControl.buildLedData(0, "light green", 0), [ [ 0x90, 0x09, 0x3c ] ]);
      assert.deepEqual(LaunchControl.buildLedData(0, "light amber", 0), [ [ 0x90, 0x09, 0x3f ] ]);

      assert.deepEqual(LaunchControl.buildLedData("all", 0, 0), [
        [ 0x90, 0x09, 0x0c ], [ 0x90, 0x0a, 0x0c ], [ 0x90, 0x0b, 0x0c ], [ 0x90, 0x0c, 0x0c ],
        [ 0x90, 0x19, 0x0c ], [ 0x90, 0x1a, 0x0c ], [ 0x90, 0x1b, 0x0c ], [ 0x90, 0x1c, 0x0c ],
      ]);

      assert.deepEqual(LaunchControl.buildLedData("even", 1, 0), [
        [ 0x90, 0x09, 0x0d ], [ 0x90, 0x0b, 0x0d ], [ 0x90, 0x19, 0x0d ], [ 0x90, 0x1b, 0x0d ],
      ]);

      assert.deepEqual(LaunchControl.buildLedData("odd", 1, 0), [
        [ 0x90, 0x0a, 0x0d ], [ 0x90, 0x0c, 0x0d ], [ 0x90, 0x1a, 0x0d ], [ 0x90, 0x1c, 0x0d ],
      ]);

      assert.deepEqual(LaunchControl.buildLedData("oooo----", 0, 0), [
        [ 0x90, 0x09, 0x0c ], [ 0x90, 0x0a, 0x0c ], [ 0x90, 0x0b, 0x0c ], [ 0x90, 0x0c, 0x0c ],
      ]);

      assert.deepEqual(LaunchControl.buildLedData("oo--", 0, 0), [
        [ 0x90, 0x09, 0x0c ], [ 0x90, 0x0a, 0x0c ], [ 0x90, 0x19, 0x0c ], [ 0x90, 0x1a, 0x0c ],
      ]);
    });
  });
  describe(".parseMessage(st: number, d1: number, d2: number): object", () => {
    it("pad", () => {
      assert.deepEqual(LaunchControl.parseMessage(0x98, 0x09, 0x7f), { dataType: "pad", track: 0, value: 127, channel: 8 });
      assert.deepEqual(LaunchControl.parseMessage(0x98, 0x0a, 0x7f), { dataType: "pad", track: 1, value: 127, channel: 8 });
      assert.deepEqual(LaunchControl.parseMessage(0x98, 0x0b, 0x7f), { dataType: "pad", track: 2, value: 127, channel: 8 });
      assert.deepEqual(LaunchControl.parseMessage(0x98, 0x0c, 0x7f), { dataType: "pad", track: 3, value: 127, channel: 8 });
      assert.deepEqual(LaunchControl.parseMessage(0x98, 0x19, 0x7f), { dataType: "pad", track: 4, value: 127, channel: 8 });
      assert.deepEqual(LaunchControl.parseMessage(0x98, 0x1a, 0x7f), { dataType: "pad", track: 5, value: 127, channel: 8 });
      assert.deepEqual(LaunchControl.parseMessage(0x98, 0x1b, 0x7f), { dataType: "pad", track: 6, value: 127, channel: 8 });
      assert.deepEqual(LaunchControl.parseMessage(0x98, 0x1c, 0x7f), { dataType: "pad", track: 7, value: 127, channel: 8 });
      assert.deepEqual(LaunchControl.parseMessage(0x99, 0x09, 0x7f), { dataType: "pad", track: 0, value: 127, channel: 9 });
      assert.deepEqual(LaunchControl.parseMessage(0x99, 0x0a, 0x7f), { dataType: "pad", track: 1, value: 127, channel: 9 });
      assert.deepEqual(LaunchControl.parseMessage(0x99, 0x0b, 0x7f), { dataType: "pad", track: 2, value: 127, channel: 9 });
      assert.deepEqual(LaunchControl.parseMessage(0x99, 0x0c, 0x7f), { dataType: "pad", track: 3, value: 127, channel: 9 });
      assert.deepEqual(LaunchControl.parseMessage(0x99, 0x19, 0x7f), { dataType: "pad", track: 4, value: 127, channel: 9 });
      assert.deepEqual(LaunchControl.parseMessage(0x99, 0x1a, 0x7f), { dataType: "pad", track: 5, value: 127, channel: 9 });
      assert.deepEqual(LaunchControl.parseMessage(0x99, 0x1b, 0x7f), { dataType: "pad", track: 6, value: 127, channel: 9 });
      assert.deepEqual(LaunchControl.parseMessage(0x99, 0x1c, 0x7f), { dataType: "pad", track: 7, value: 127, channel: 9 });
      assert.deepEqual(LaunchControl.parseMessage(0x9a, 0x09, 0x7f), { dataType: "pad", track: 0, value: 127, channel: 10 });
      assert.deepEqual(LaunchControl.parseMessage(0x9a, 0x0a, 0x7f), { dataType: "pad", track: 1, value: 127, channel: 10 });
      assert.deepEqual(LaunchControl.parseMessage(0x9a, 0x0b, 0x7f), { dataType: "pad", track: 2, value: 127, channel: 10 });
      assert.deepEqual(LaunchControl.parseMessage(0x9a, 0x0c, 0x7f), { dataType: "pad", track: 3, value: 127, channel: 10 });
      assert.deepEqual(LaunchControl.parseMessage(0x9a, 0x19, 0x7f), { dataType: "pad", track: 4, value: 127, channel: 10 });
      assert.deepEqual(LaunchControl.parseMessage(0x9a, 0x1a, 0x7f), { dataType: "pad", track: 5, value: 127, channel: 10 });
      assert.deepEqual(LaunchControl.parseMessage(0x9a, 0x1b, 0x7f), { dataType: "pad", track: 6, value: 127, channel: 10 });
      assert.deepEqual(LaunchControl.parseMessage(0x9a, 0x1c, 0x7f), { dataType: "pad", track: 7, value: 127, channel: 10 });
      assert.deepEqual(LaunchControl.parseMessage(0x9b, 0x09, 0x7f), { dataType: "pad", track: 0, value: 127, channel: 11 });
      assert.deepEqual(LaunchControl.parseMessage(0x9b, 0x0a, 0x7f), { dataType: "pad", track: 1, value: 127, channel: 11 });
      assert.deepEqual(LaunchControl.parseMessage(0x9b, 0x0b, 0x7f), { dataType: "pad", track: 2, value: 127, channel: 11 });
      assert.deepEqual(LaunchControl.parseMessage(0x9b, 0x0c, 0x7f), { dataType: "pad", track: 3, value: 127, channel: 11 });
      assert.deepEqual(LaunchControl.parseMessage(0x9b, 0x19, 0x7f), { dataType: "pad", track: 4, value: 127, channel: 11 });
      assert.deepEqual(LaunchControl.parseMessage(0x9b, 0x1a, 0x7f), { dataType: "pad", track: 5, value: 127, channel: 11 });
      assert.deepEqual(LaunchControl.parseMessage(0x9b, 0x1b, 0x7f), { dataType: "pad", track: 6, value: 127, channel: 11 });
      assert.deepEqual(LaunchControl.parseMessage(0x9b, 0x1c, 0x7f), { dataType: "pad", track: 7, value: 127, channel: 11 });
      assert.deepEqual(LaunchControl.parseMessage(0x9c, 0x09, 0x7f), { dataType: "pad", track: 0, value: 127, channel: 12 });
      assert.deepEqual(LaunchControl.parseMessage(0x9c, 0x0a, 0x7f), { dataType: "pad", track: 1, value: 127, channel: 12 });
      assert.deepEqual(LaunchControl.parseMessage(0x9c, 0x0b, 0x7f), { dataType: "pad", track: 2, value: 127, channel: 12 });
      assert.deepEqual(LaunchControl.parseMessage(0x9c, 0x0c, 0x7f), { dataType: "pad", track: 3, value: 127, channel: 12 });
      assert.deepEqual(LaunchControl.parseMessage(0x9c, 0x19, 0x7f), { dataType: "pad", track: 4, value: 127, channel: 12 });
      assert.deepEqual(LaunchControl.parseMessage(0x9c, 0x1a, 0x7f), { dataType: "pad", track: 5, value: 127, channel: 12 });
      assert.deepEqual(LaunchControl.parseMessage(0x9c, 0x1b, 0x7f), { dataType: "pad", track: 6, value: 127, channel: 12 });
      assert.deepEqual(LaunchControl.parseMessage(0x9c, 0x1c, 0x7f), { dataType: "pad", track: 7, value: 127, channel: 12 });
      assert.deepEqual(LaunchControl.parseMessage(0x9d, 0x09, 0x7f), { dataType: "pad", track: 0, value: 127, channel: 13 });
      assert.deepEqual(LaunchControl.parseMessage(0x9d, 0x0a, 0x7f), { dataType: "pad", track: 1, value: 127, channel: 13 });
      assert.deepEqual(LaunchControl.parseMessage(0x9d, 0x0b, 0x7f), { dataType: "pad", track: 2, value: 127, channel: 13 });
      assert.deepEqual(LaunchControl.parseMessage(0x9d, 0x0c, 0x7f), { dataType: "pad", track: 3, value: 127, channel: 13 });
      assert.deepEqual(LaunchControl.parseMessage(0x9d, 0x19, 0x7f), { dataType: "pad", track: 4, value: 127, channel: 13 });
      assert.deepEqual(LaunchControl.parseMessage(0x9d, 0x1a, 0x7f), { dataType: "pad", track: 5, value: 127, channel: 13 });
      assert.deepEqual(LaunchControl.parseMessage(0x9d, 0x1b, 0x7f), { dataType: "pad", track: 6, value: 127, channel: 13 });
      assert.deepEqual(LaunchControl.parseMessage(0x9d, 0x1c, 0x7f), { dataType: "pad", track: 7, value: 127, channel: 13 });
      assert.deepEqual(LaunchControl.parseMessage(0x9e, 0x09, 0x7f), { dataType: "pad", track: 0, value: 127, channel: 14 });
      assert.deepEqual(LaunchControl.parseMessage(0x9e, 0x0a, 0x7f), { dataType: "pad", track: 1, value: 127, channel: 14 });
      assert.deepEqual(LaunchControl.parseMessage(0x9e, 0x0b, 0x7f), { dataType: "pad", track: 2, value: 127, channel: 14 });
      assert.deepEqual(LaunchControl.parseMessage(0x9e, 0x0c, 0x7f), { dataType: "pad", track: 3, value: 127, channel: 14 });
      assert.deepEqual(LaunchControl.parseMessage(0x9e, 0x19, 0x7f), { dataType: "pad", track: 4, value: 127, channel: 14 });
      assert.deepEqual(LaunchControl.parseMessage(0x9e, 0x1a, 0x7f), { dataType: "pad", track: 5, value: 127, channel: 14 });
      assert.deepEqual(LaunchControl.parseMessage(0x9e, 0x1b, 0x7f), { dataType: "pad", track: 6, value: 127, channel: 14 });
      assert.deepEqual(LaunchControl.parseMessage(0x9e, 0x1c, 0x7f), { dataType: "pad", track: 7, value: 127, channel: 14 });
      assert.deepEqual(LaunchControl.parseMessage(0x9f, 0x09, 0x7f), { dataType: "pad", track: 0, value: 127, channel: 15 });
      assert.deepEqual(LaunchControl.parseMessage(0x9f, 0x0a, 0x7f), { dataType: "pad", track: 1, value: 127, channel: 15 });
      assert.deepEqual(LaunchControl.parseMessage(0x9f, 0x0b, 0x7f), { dataType: "pad", track: 2, value: 127, channel: 15 });
      assert.deepEqual(LaunchControl.parseMessage(0x9f, 0x0c, 0x7f), { dataType: "pad", track: 3, value: 127, channel: 15 });
      assert.deepEqual(LaunchControl.parseMessage(0x9f, 0x19, 0x7f), { dataType: "pad", track: 4, value: 127, channel: 15 });
      assert.deepEqual(LaunchControl.parseMessage(0x9f, 0x1a, 0x7f), { dataType: "pad", track: 5, value: 127, channel: 15 });
      assert.deepEqual(LaunchControl.parseMessage(0x9f, 0x1b, 0x7f), { dataType: "pad", track: 6, value: 127, channel: 15 });
      assert.deepEqual(LaunchControl.parseMessage(0x9f, 0x1c, 0x7f), { dataType: "pad", track: 7, value: 127, channel: 15 });
    });
    it("knob1", function() {
      assert.deepEqual(LaunchControl.parseMessage(0xb8, 0x15, 0x00), { dataType: "knob1", track: 0, value: 0, channel: 8 });
      assert.deepEqual(LaunchControl.parseMessage(0xb8, 0x16, 0x01), { dataType: "knob1", track: 1, value: 1, channel: 8 });
      assert.deepEqual(LaunchControl.parseMessage(0xb8, 0x17, 0x02), { dataType: "knob1", track: 2, value: 2, channel: 8 });
      assert.deepEqual(LaunchControl.parseMessage(0xb8, 0x18, 0x03), { dataType: "knob1", track: 3, value: 3, channel: 8 });
      assert.deepEqual(LaunchControl.parseMessage(0xb8, 0x19, 0x04), { dataType: "knob1", track: 4, value: 4, channel: 8 });
      assert.deepEqual(LaunchControl.parseMessage(0xb8, 0x1a, 0x05), { dataType: "knob1", track: 5, value: 5, channel: 8 });
      assert.deepEqual(LaunchControl.parseMessage(0xb8, 0x1b, 0x06), { dataType: "knob1", track: 6, value: 6, channel: 8 });
      assert.deepEqual(LaunchControl.parseMessage(0xb8, 0x1c, 0x07), { dataType: "knob1", track: 7, value: 7, channel: 8 });
      assert.deepEqual(LaunchControl.parseMessage(0xb9, 0x15, 0x08), { dataType: "knob1", track: 0, value: 8, channel: 9 });
      assert.deepEqual(LaunchControl.parseMessage(0xb9, 0x16, 0x09), { dataType: "knob1", track: 1, value: 9, channel: 9 });
      assert.deepEqual(LaunchControl.parseMessage(0xb9, 0x17, 0x0a), { dataType: "knob1", track: 2, value: 10, channel: 9 });
      assert.deepEqual(LaunchControl.parseMessage(0xb9, 0x18, 0x0b), { dataType: "knob1", track: 3, value: 11, channel: 9 });
      assert.deepEqual(LaunchControl.parseMessage(0xb9, 0x19, 0x0c), { dataType: "knob1", track: 4, value: 12, channel: 9 });
      assert.deepEqual(LaunchControl.parseMessage(0xb9, 0x1a, 0x0d), { dataType: "knob1", track: 5, value: 13, channel: 9 });
      assert.deepEqual(LaunchControl.parseMessage(0xb9, 0x1b, 0x0e), { dataType: "knob1", track: 6, value: 14, channel: 9 });
      assert.deepEqual(LaunchControl.parseMessage(0xb9, 0x1c, 0x0f), { dataType: "knob1", track: 7, value: 15, channel: 9 });
      assert.deepEqual(LaunchControl.parseMessage(0xba, 0x15, 0x10), { dataType: "knob1", track: 0, value: 16, channel: 10 });
      assert.deepEqual(LaunchControl.parseMessage(0xba, 0x16, 0x11), { dataType: "knob1", track: 1, value: 17, channel: 10 });
      assert.deepEqual(LaunchControl.parseMessage(0xba, 0x17, 0x12), { dataType: "knob1", track: 2, value: 18, channel: 10 });
      assert.deepEqual(LaunchControl.parseMessage(0xba, 0x18, 0x13), { dataType: "knob1", track: 3, value: 19, channel: 10 });
      assert.deepEqual(LaunchControl.parseMessage(0xba, 0x19, 0x14), { dataType: "knob1", track: 4, value: 20, channel: 10 });
      assert.deepEqual(LaunchControl.parseMessage(0xba, 0x1a, 0x15), { dataType: "knob1", track: 5, value: 21, channel: 10 });
      assert.deepEqual(LaunchControl.parseMessage(0xba, 0x1b, 0x16), { dataType: "knob1", track: 6, value: 22, channel: 10 });
      assert.deepEqual(LaunchControl.parseMessage(0xba, 0x1c, 0x17), { dataType: "knob1", track: 7, value: 23, channel: 10 });
      assert.deepEqual(LaunchControl.parseMessage(0xbb, 0x15, 0x18), { dataType: "knob1", track: 0, value: 24, channel: 11 });
      assert.deepEqual(LaunchControl.parseMessage(0xbb, 0x16, 0x19), { dataType: "knob1", track: 1, value: 25, channel: 11 });
      assert.deepEqual(LaunchControl.parseMessage(0xbb, 0x17, 0x1a), { dataType: "knob1", track: 2, value: 26, channel: 11 });
      assert.deepEqual(LaunchControl.parseMessage(0xbb, 0x18, 0x1b), { dataType: "knob1", track: 3, value: 27, channel: 11 });
      assert.deepEqual(LaunchControl.parseMessage(0xbb, 0x19, 0x1c), { dataType: "knob1", track: 4, value: 28, channel: 11 });
      assert.deepEqual(LaunchControl.parseMessage(0xbb, 0x1a, 0x1d), { dataType: "knob1", track: 5, value: 29, channel: 11 });
      assert.deepEqual(LaunchControl.parseMessage(0xbb, 0x1b, 0x1e), { dataType: "knob1", track: 6, value: 30, channel: 11 });
      assert.deepEqual(LaunchControl.parseMessage(0xbb, 0x1c, 0x1f), { dataType: "knob1", track: 7, value: 31, channel: 11 });
      assert.deepEqual(LaunchControl.parseMessage(0xbc, 0x15, 0x20), { dataType: "knob1", track: 0, value: 32, channel: 12 });
      assert.deepEqual(LaunchControl.parseMessage(0xbc, 0x16, 0x21), { dataType: "knob1", track: 1, value: 33, channel: 12 });
      assert.deepEqual(LaunchControl.parseMessage(0xbc, 0x17, 0x22), { dataType: "knob1", track: 2, value: 34, channel: 12 });
      assert.deepEqual(LaunchControl.parseMessage(0xbc, 0x18, 0x23), { dataType: "knob1", track: 3, value: 35, channel: 12 });
      assert.deepEqual(LaunchControl.parseMessage(0xbc, 0x19, 0x24), { dataType: "knob1", track: 4, value: 36, channel: 12 });
      assert.deepEqual(LaunchControl.parseMessage(0xbc, 0x1a, 0x25), { dataType: "knob1", track: 5, value: 37, channel: 12 });
      assert.deepEqual(LaunchControl.parseMessage(0xbc, 0x1b, 0x26), { dataType: "knob1", track: 6, value: 38, channel: 12 });
      assert.deepEqual(LaunchControl.parseMessage(0xbc, 0x1c, 0x27), { dataType: "knob1", track: 7, value: 39, channel: 12 });
      assert.deepEqual(LaunchControl.parseMessage(0xbd, 0x15, 0x28), { dataType: "knob1", track: 0, value: 40, channel: 13 });
      assert.deepEqual(LaunchControl.parseMessage(0xbd, 0x16, 0x29), { dataType: "knob1", track: 1, value: 41, channel: 13 });
      assert.deepEqual(LaunchControl.parseMessage(0xbd, 0x17, 0x2a), { dataType: "knob1", track: 2, value: 42, channel: 13 });
      assert.deepEqual(LaunchControl.parseMessage(0xbd, 0x18, 0x2b), { dataType: "knob1", track: 3, value: 43, channel: 13 });
      assert.deepEqual(LaunchControl.parseMessage(0xbd, 0x19, 0x2c), { dataType: "knob1", track: 4, value: 44, channel: 13 });
      assert.deepEqual(LaunchControl.parseMessage(0xbd, 0x1a, 0x2d), { dataType: "knob1", track: 5, value: 45, channel: 13 });
      assert.deepEqual(LaunchControl.parseMessage(0xbd, 0x1b, 0x2e), { dataType: "knob1", track: 6, value: 46, channel: 13 });
      assert.deepEqual(LaunchControl.parseMessage(0xbd, 0x1c, 0x2f), { dataType: "knob1", track: 7, value: 47, channel: 13 });
      assert.deepEqual(LaunchControl.parseMessage(0xbe, 0x15, 0x30), { dataType: "knob1", track: 0, value: 48, channel: 14 });
      assert.deepEqual(LaunchControl.parseMessage(0xbe, 0x16, 0x31), { dataType: "knob1", track: 1, value: 49, channel: 14 });
      assert.deepEqual(LaunchControl.parseMessage(0xbe, 0x17, 0x32), { dataType: "knob1", track: 2, value: 50, channel: 14 });
      assert.deepEqual(LaunchControl.parseMessage(0xbe, 0x18, 0x33), { dataType: "knob1", track: 3, value: 51, channel: 14 });
      assert.deepEqual(LaunchControl.parseMessage(0xbe, 0x19, 0x34), { dataType: "knob1", track: 4, value: 52, channel: 14 });
      assert.deepEqual(LaunchControl.parseMessage(0xbe, 0x1a, 0x35), { dataType: "knob1", track: 5, value: 53, channel: 14 });
      assert.deepEqual(LaunchControl.parseMessage(0xbe, 0x1b, 0x36), { dataType: "knob1", track: 6, value: 54, channel: 14 });
      assert.deepEqual(LaunchControl.parseMessage(0xbe, 0x1c, 0x37), { dataType: "knob1", track: 7, value: 55, channel: 14 });
      assert.deepEqual(LaunchControl.parseMessage(0xbf, 0x15, 0x38), { dataType: "knob1", track: 0, value: 56, channel: 15 });
      assert.deepEqual(LaunchControl.parseMessage(0xbf, 0x16, 0x39), { dataType: "knob1", track: 1, value: 57, channel: 15 });
      assert.deepEqual(LaunchControl.parseMessage(0xbf, 0x17, 0x3a), { dataType: "knob1", track: 2, value: 58, channel: 15 });
      assert.deepEqual(LaunchControl.parseMessage(0xbf, 0x18, 0x3b), { dataType: "knob1", track: 3, value: 59, channel: 15 });
      assert.deepEqual(LaunchControl.parseMessage(0xbf, 0x19, 0x3c), { dataType: "knob1", track: 4, value: 60, channel: 15 });
      assert.deepEqual(LaunchControl.parseMessage(0xbf, 0x1a, 0x3d), { dataType: "knob1", track: 5, value: 61, channel: 15 });
      assert.deepEqual(LaunchControl.parseMessage(0xbf, 0x1b, 0x3e), { dataType: "knob1", track: 6, value: 62, channel: 15 });
      assert.deepEqual(LaunchControl.parseMessage(0xbf, 0x1c, 0x3f), { dataType: "knob1", track: 7, value: 63, channel: 15 });
    });
    it("knob2", () => {
      assert.deepEqual(LaunchControl.parseMessage(0xb8, 0x29, 0x40), { dataType: "knob2", track: 0, value: 64, channel: 8 });
      assert.deepEqual(LaunchControl.parseMessage(0xb8, 0x2a, 0x41), { dataType: "knob2", track: 1, value: 65, channel: 8 });
      assert.deepEqual(LaunchControl.parseMessage(0xb8, 0x2b, 0x42), { dataType: "knob2", track: 2, value: 66, channel: 8 });
      assert.deepEqual(LaunchControl.parseMessage(0xb8, 0x2c, 0x43), { dataType: "knob2", track: 3, value: 67, channel: 8 });
      assert.deepEqual(LaunchControl.parseMessage(0xb8, 0x2d, 0x44), { dataType: "knob2", track: 4, value: 68, channel: 8 });
      assert.deepEqual(LaunchControl.parseMessage(0xb8, 0x2e, 0x45), { dataType: "knob2", track: 5, value: 69, channel: 8 });
      assert.deepEqual(LaunchControl.parseMessage(0xb8, 0x2f, 0x46), { dataType: "knob2", track: 6, value: 70, channel: 8 });
      assert.deepEqual(LaunchControl.parseMessage(0xb8, 0x30, 0x47), { dataType: "knob2", track: 7, value: 71, channel: 8 });
      assert.deepEqual(LaunchControl.parseMessage(0xb9, 0x29, 0x48), { dataType: "knob2", track: 0, value: 72, channel: 9 });
      assert.deepEqual(LaunchControl.parseMessage(0xb9, 0x2a, 0x49), { dataType: "knob2", track: 1, value: 73, channel: 9 });
      assert.deepEqual(LaunchControl.parseMessage(0xb9, 0x2b, 0x4a), { dataType: "knob2", track: 2, value: 74, channel: 9 });
      assert.deepEqual(LaunchControl.parseMessage(0xb9, 0x2c, 0x4b), { dataType: "knob2", track: 3, value: 75, channel: 9 });
      assert.deepEqual(LaunchControl.parseMessage(0xb9, 0x2d, 0x4c), { dataType: "knob2", track: 4, value: 76, channel: 9 });
      assert.deepEqual(LaunchControl.parseMessage(0xb9, 0x2e, 0x4d), { dataType: "knob2", track: 5, value: 77, channel: 9 });
      assert.deepEqual(LaunchControl.parseMessage(0xb9, 0x2f, 0x4e), { dataType: "knob2", track: 6, value: 78, channel: 9 });
      assert.deepEqual(LaunchControl.parseMessage(0xb9, 0x30, 0x4f), { dataType: "knob2", track: 7, value: 79, channel: 9 });
      assert.deepEqual(LaunchControl.parseMessage(0xba, 0x29, 0x50), { dataType: "knob2", track: 0, value: 80, channel: 10 });
      assert.deepEqual(LaunchControl.parseMessage(0xba, 0x2a, 0x51), { dataType: "knob2", track: 1, value: 81, channel: 10 });
      assert.deepEqual(LaunchControl.parseMessage(0xba, 0x2b, 0x52), { dataType: "knob2", track: 2, value: 82, channel: 10 });
      assert.deepEqual(LaunchControl.parseMessage(0xba, 0x2c, 0x53), { dataType: "knob2", track: 3, value: 83, channel: 10 });
      assert.deepEqual(LaunchControl.parseMessage(0xba, 0x2d, 0x54), { dataType: "knob2", track: 4, value: 84, channel: 10 });
      assert.deepEqual(LaunchControl.parseMessage(0xba, 0x2e, 0x55), { dataType: "knob2", track: 5, value: 85, channel: 10 });
      assert.deepEqual(LaunchControl.parseMessage(0xba, 0x2f, 0x56), { dataType: "knob2", track: 6, value: 86, channel: 10 });
      assert.deepEqual(LaunchControl.parseMessage(0xba, 0x30, 0x57), { dataType: "knob2", track: 7, value: 87, channel: 10 });
      assert.deepEqual(LaunchControl.parseMessage(0xbb, 0x29, 0x58), { dataType: "knob2", track: 0, value: 88, channel: 11 });
      assert.deepEqual(LaunchControl.parseMessage(0xbb, 0x2a, 0x59), { dataType: "knob2", track: 1, value: 89, channel: 11 });
      assert.deepEqual(LaunchControl.parseMessage(0xbb, 0x2b, 0x5a), { dataType: "knob2", track: 2, value: 90, channel: 11 });
      assert.deepEqual(LaunchControl.parseMessage(0xbb, 0x2c, 0x5b), { dataType: "knob2", track: 3, value: 91, channel: 11 });
      assert.deepEqual(LaunchControl.parseMessage(0xbb, 0x2d, 0x5c), { dataType: "knob2", track: 4, value: 92, channel: 11 });
      assert.deepEqual(LaunchControl.parseMessage(0xbb, 0x2e, 0x5d), { dataType: "knob2", track: 5, value: 93, channel: 11 });
      assert.deepEqual(LaunchControl.parseMessage(0xbb, 0x2f, 0x5e), { dataType: "knob2", track: 6, value: 94, channel: 11 });
      assert.deepEqual(LaunchControl.parseMessage(0xbb, 0x30, 0x5f), { dataType: "knob2", track: 7, value: 95, channel: 11 });
      assert.deepEqual(LaunchControl.parseMessage(0xbc, 0x29, 0x60), { dataType: "knob2", track: 0, value: 96, channel: 12 });
      assert.deepEqual(LaunchControl.parseMessage(0xbc, 0x2a, 0x61), { dataType: "knob2", track: 1, value: 97, channel: 12 });
      assert.deepEqual(LaunchControl.parseMessage(0xbc, 0x2b, 0x62), { dataType: "knob2", track: 2, value: 98, channel: 12 });
      assert.deepEqual(LaunchControl.parseMessage(0xbc, 0x2c, 0x63), { dataType: "knob2", track: 3, value: 99, channel: 12 });
      assert.deepEqual(LaunchControl.parseMessage(0xbc, 0x2d, 0x64), { dataType: "knob2", track: 4, value: 100, channel: 12 });
      assert.deepEqual(LaunchControl.parseMessage(0xbc, 0x2e, 0x65), { dataType: "knob2", track: 5, value: 101, channel: 12 });
      assert.deepEqual(LaunchControl.parseMessage(0xbc, 0x2f, 0x66), { dataType: "knob2", track: 6, value: 102, channel: 12 });
      assert.deepEqual(LaunchControl.parseMessage(0xbc, 0x30, 0x67), { dataType: "knob2", track: 7, value: 103, channel: 12 });
      assert.deepEqual(LaunchControl.parseMessage(0xbd, 0x29, 0x68), { dataType: "knob2", track: 0, value: 104, channel: 13 });
      assert.deepEqual(LaunchControl.parseMessage(0xbd, 0x2a, 0x69), { dataType: "knob2", track: 1, value: 105, channel: 13 });
      assert.deepEqual(LaunchControl.parseMessage(0xbd, 0x2b, 0x6a), { dataType: "knob2", track: 2, value: 106, channel: 13 });
      assert.deepEqual(LaunchControl.parseMessage(0xbd, 0x2c, 0x6b), { dataType: "knob2", track: 3, value: 107, channel: 13 });
      assert.deepEqual(LaunchControl.parseMessage(0xbd, 0x2d, 0x6c), { dataType: "knob2", track: 4, value: 108, channel: 13 });
      assert.deepEqual(LaunchControl.parseMessage(0xbd, 0x2e, 0x6d), { dataType: "knob2", track: 5, value: 109, channel: 13 });
      assert.deepEqual(LaunchControl.parseMessage(0xbd, 0x2f, 0x6e), { dataType: "knob2", track: 6, value: 110, channel: 13 });
      assert.deepEqual(LaunchControl.parseMessage(0xbd, 0x30, 0x6f), { dataType: "knob2", track: 7, value: 111, channel: 13 });
      assert.deepEqual(LaunchControl.parseMessage(0xbe, 0x29, 0x70), { dataType: "knob2", track: 0, value: 112, channel: 14 });
      assert.deepEqual(LaunchControl.parseMessage(0xbe, 0x2a, 0x71), { dataType: "knob2", track: 1, value: 113, channel: 14 });
      assert.deepEqual(LaunchControl.parseMessage(0xbe, 0x2b, 0x72), { dataType: "knob2", track: 2, value: 114, channel: 14 });
      assert.deepEqual(LaunchControl.parseMessage(0xbe, 0x2c, 0x73), { dataType: "knob2", track: 3, value: 115, channel: 14 });
      assert.deepEqual(LaunchControl.parseMessage(0xbe, 0x2d, 0x74), { dataType: "knob2", track: 4, value: 116, channel: 14 });
      assert.deepEqual(LaunchControl.parseMessage(0xbe, 0x2e, 0x75), { dataType: "knob2", track: 5, value: 117, channel: 14 });
      assert.deepEqual(LaunchControl.parseMessage(0xbe, 0x2f, 0x76), { dataType: "knob2", track: 6, value: 118, channel: 14 });
      assert.deepEqual(LaunchControl.parseMessage(0xbe, 0x30, 0x77), { dataType: "knob2", track: 7, value: 119, channel: 14 });
      assert.deepEqual(LaunchControl.parseMessage(0xbf, 0x29, 0x78), { dataType: "knob2", track: 0, value: 120, channel: 15 });
      assert.deepEqual(LaunchControl.parseMessage(0xbf, 0x2a, 0x79), { dataType: "knob2", track: 1, value: 121, channel: 15 });
      assert.deepEqual(LaunchControl.parseMessage(0xbf, 0x2b, 0x7a), { dataType: "knob2", track: 2, value: 122, channel: 15 });
      assert.deepEqual(LaunchControl.parseMessage(0xbf, 0x2c, 0x7b), { dataType: "knob2", track: 3, value: 123, channel: 15 });
      assert.deepEqual(LaunchControl.parseMessage(0xbf, 0x2d, 0x7c), { dataType: "knob2", track: 4, value: 124, channel: 15 });
      assert.deepEqual(LaunchControl.parseMessage(0xbf, 0x2e, 0x7d), { dataType: "knob2", track: 5, value: 125, channel: 15 });
      assert.deepEqual(LaunchControl.parseMessage(0xbf, 0x2f, 0x7e), { dataType: "knob2", track: 6, value: 126, channel: 15 });
      assert.deepEqual(LaunchControl.parseMessage(0xbf, 0x30, 0x7f), { dataType: "knob2", track: 7, value: 127, channel: 15 });
    });
    it("cursor", () => {
      // ↑
      assert.deepEqual(LaunchControl.parseMessage(0xb8, 0x72, 0x7f), { dataType: "cursor", direction: "up", value: 127, channel: 8 });
      assert.deepEqual(LaunchControl.parseMessage(0xb9, 0x72, 0x00), null);
      // ↓
      assert.deepEqual(LaunchControl.parseMessage(0xba, 0x73, 0x7f), { dataType: "cursor", direction: "down", value: 127, channel: 10 });
      assert.deepEqual(LaunchControl.parseMessage(0xbb, 0x73, 0x00), null);
      // ←
      assert.deepEqual(LaunchControl.parseMessage(0xbc, 0x74, 0x7f), { dataType: "cursor", direction: "left", value: 127, channel: 12 });
      assert.deepEqual(LaunchControl.parseMessage(0xbd, 0x74, 0x00), null);
      // →
      assert.deepEqual(LaunchControl.parseMessage(0xbe, 0x75, 0x7f), { dataType: "cursor", direction: "right", value: 127, channel: 14 });
      assert.deepEqual(LaunchControl.parseMessage(0xbf, 0x75, 0x00), null);
    });
    it("others", () => {
      // pad (release)
      assert.deepEqual(LaunchControl.parseMessage(0x88, 0x09, 0x00), null);
      // unknown
      assert.deepEqual(LaunchControl.parseMessage(0x98, 0xa0, 0x7f), null);
      assert.deepEqual(LaunchControl.parseMessage(0xb0, 0x70, 0x7f), null);
    });
  });
});
