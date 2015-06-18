import EventEmitter from "./EventEmitter";
import Constants from "./Constants";
import Parser from "./Parser";

function findMIDIPortByName(iter, deviceName) {
  for (let x = iter.next(); !x.done; x = iter.next()) {
    if (x.value.name === deviceName) {
      return x.value;
    }
  }

  return null;
}

export default class LaunchControl extends EventEmitter {
  constructor(deviceName = Constants.DEVICE_NAME) {
    super();

    this._input = null;
    this._deviceName = deviceName;
  }

  open() {
    return new Promise((resolve, reject) => {
      if (!global.navigator && typeof global.navigator.requestMIDIAccess !== "function") {
        return reject(new TypeError("Web MIDI API is not supported"));
      }

      if (this._input !== null) {
        return resolve(this._input);
      }

      let successCallback = (m) => {
        let input = findMIDIPortByName(m.inputs.values(), this._deviceName);

        if (input === null) {
          return reject(new TypeError("Launch Control is not found"));
        }

        this._input = input;

        input.onmidimessage = (e) => {
          let payload = Parser.parse(e.data[0], e.data[1], e.data[2]);
          if (payload) {
            this.emit("message", {
              type: "message",
              control: payload.control,
              track: payload.track,
              value: payload.value,
              channel: payload.channel,
            });
          }
        };

        return input.open().then(resolve, reject);
      };

      return global.navigator.requestMIDIAccess().then(successCallback, reject);
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      if (this._input === null) {
        return reject(new TypeError("Launch Control is not opened"));
      }
      this._input.close().then(resolve, reject);
      this._input = null;
    });
  }
}
