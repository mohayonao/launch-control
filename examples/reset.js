(function(LaunchControl) {
  "use strict";

  var ctrl = new LaunchControl();

  Promise.resolve().then(function() {
    return ctrl.open();
  }).then(function() {
    for (var ch = 0; ch < 15; ch++) {
      ctrl.led("all", "off", ch);
    }
  }).then(function() {
    return ctrl.close();
  }).then(function() {
    console.log("done!");
  }).catch(function(e) {
    console.error("ERROR: ", e.toString());
  });

})((this.self || global).LaunchControl || require("../"));
