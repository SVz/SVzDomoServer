$(function() {
  $('.text').on("click", function(e) {
    var lamp = $(e.currentTarget)
    toggle(lamp.data("light"), lamp)
  });
  $("body").swipe({
    swipeLeft:function(event, direction, distance, duration, fingerCount) {
      //This only fires when the user swipes left
      window.location = "/video"
    },
    swipeRight:function(event, direction, distance, duration, fingerCount) {
      //This only fires when the user swipes left
      window.location = "/"
    }
  });

  var keywords = [{word: "ALLUMER", action: "on"}, {word: "ETEINDRE", action: "off"}]
  var recording = false
  var recognition = new webkitSpeechRecognition();
  recognition.lang = "fr-FR";
  //recognition.continuous = true;
  //recognition.interimResults = true;

  recognition.onresult = function(e) {
    var res = e.results[0][0].transcript.replace(/é/g, "e");

    var mbKey = _.find(keywords, function(k) {
      return _.contains(res, k.word)
    })

    if(mbKey) {
      var pin = _.find(pins, function(p) {
        return _.contains(res.toUpperCase(), p.name.toUpperCase())
      });
      $.get('/'+pin.id+"/"+mbKey.action)
    }

  }

  $('#voice').on("click", function(e) {
    e.preventDefault();
    if(recording) {
      recognition.stop();
      recording = false;
    } else {
      console.log("starting")
      recognition.start();
      recording = true;
    }
  })
});

function tog(st) { return st=="on" ? "off" : "on"}
function toggle(state, lamp) {
  var next = tog(state)
  console.log(next)
  lamp.removeClass(state).addClass(next)
  lamp.data("light", next)
  lamp.find("img").removeClass(state).addClass(next)
  $.get('/'+lamp.attr('id')+'/'+next)
}