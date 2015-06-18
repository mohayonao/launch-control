import { input as MidiInput } from "midi";
import EventEmitter from "./EventEmitter";
import Constants from "./Constants";
import Parser from "./Parser";

function findPortNumberByName(input, deviceName) {
  let portCount = input.getPortCount();

  for (let i = 0; i < portCount; i++) {
    if (input.getPortName(i) === deviceName) {
      return i;
    }
  }

  return -1;
}

export default class LaunchControl extends EventEmitter {
  constructor(deviceName = Constants.DEVICE_NAME) {
    super();

    this._input = null;
    this._deviceName = deviceName;
  }

  open() {
    return new Promise((resolve, reject) => {
      if (this._input !== null) {
        return resolve(this._input);
      }

      let input = new MidiInput();
      let portNumber = findPortNumberByName(input, this._deviceName);

      if (portNumber === -1) {
        return reject(new TypeError("Launch Control is not found"));
      }

      this._input = input;

      input.openPort(portNumber);
      input.on("message", (deltaTime, data) => {
        let payload = Parser.parse(data[0], data[1], data[2]);
        if (payload) {
          this.emit("message", {
            type: "message",
            control: payload.control,
            track: payload.track,
            value: payload.value,
            channel: payload.channel,
          });
        }
      });

      resolve(input);
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      if (this._input === null) {
        return reject(new TypeError("Launch Control is not opened"));
      }
      let input = this._input;

      this._input.closePort();
      this._input = null;

      resolve(input);
    });
  }
}
