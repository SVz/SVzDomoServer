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

  var recording = false
  var recognition = new webkitSpeechRecognition();
  recognition.lang = "fr-FR";
  //recognition.continuous = true;
  //recognition.interimResults = true;
  recognition.onresult = function(e) {
    console.log("toto", e.results[0][0].transcript)
    $('#speech').append('<p>'+e.results[0][0].transcript+'</p>')
  }
  $('#voice').on("click", function(e) {
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