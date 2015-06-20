(function(LaunchControl) {
  "use strict";

  var ctrl = new LaunchControl();

  Promise.resolve().then(function() {
    return ctrl.open();
  }).then(function() {
    ctrl.on("message", function(e) {
      console.log(JSON.stringify(e));
    });
  }).catch(function(e) {
    console.log("ERROR: " + e.toString());
  });

})((this.self || global).LaunchControl || require("../"));
