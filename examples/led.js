(function(LaunchControl) {
  "use strict";

  var ctrl = new LaunchControl();
  var values = [ [ 0, 0 ], [ 0, 0 ], [ 0, 0 ], [ 0, 0 ], [ 0, 0 ], [ 0, 0 ], [ 0, 0 ], [ 0, 0 ] ];

  Promise.resolve().then(function() {
    return ctrl.open();
  }).then(function() {
    for (var ch = 0; ch < 15; ch++) {
      ctrl.led("all", "off", ch);
    }
  }).then(function() {
    ctrl.on("message", function(e) {
      var track = e.track;

      if (e.control === "knob1") {
        values[track][0] = e.value >> 5;
      }
      if (e.control === "knob2") {
        values[track][1] = e.value >> 5;
      }
      if (e.control === "pad") {
        values[track][0] = 0;
        values[track][1] = 0;
      }

      var color = (values[track][0] << 2) + values[track][1];

      ctrl.led(track, color);

      console.log("track: " + track + ", green: " + values[track][0] + ", red: " + values[track][1] + ", color: " + color);
    });
  }).catch(function(e) {
    console.log("ERROR: " + e.toString());
  });

})((this.self || global).LaunchControl || require("../"));
