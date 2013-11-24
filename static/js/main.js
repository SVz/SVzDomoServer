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

  var keywords = [
    {word: "ALLUMER", action: "on"}, 
    {word: "ETEINDRE", action: "off"}, 
    {word: "MONTER", action: "on"},
    {word: "DESCENDRE", action: "off"},
    {word: "OUVRIR", action: "on"},
    {word: "FERMER", action: "off"}
    ]
  var recording = false
  var recognition = new webkitSpeechRecognition();
  recognition.lang = "fr-FR";
  //recognition.continuous = true;
  //recognition.interimResults = true;
  //var res = "ALLUMER LA LAMPE DE LA TELE"
  pins = _.map(pins, function(pi) {return {id: pi.id, names: pi.name.toUpperCase().split(" ")}})


  recognition.onresult = function(e) {
    var res = e.results[0][0].transcript.replace(/é/g, "e").toUpperCase();
    
    
    var mbKey = _.find(keywords, function(k) {
      return _.contains(res, k.word)
    })


    if(mbKey) {
      var pin = _.find(pins, function(p) {
        return _.every(p.names, function(ap) {
          return _.contains(res, ap);
        })
      });
      //$('#debug').append("<p>"+'/'+pin.id+"/"+mbKey.action+"</p>")
      if(pin) {
        $.get('/'+pin.id+"/"+mbKey.action)
        turn($('#'+pin.id), mbKey.action)
      }
    }
  }

  $('#voice').on("click", function(e) {
    e.preventDefault();
    // if(recording) {
    //   recognition.stop();
    //   recording = false;
    // } else {
      console.log("starting")
      recognition.start();
      recording = true;
    //}
  })
});

function tog(st) { return st=="on" ? "off" : "on"}
function toggle(state, lamp) {
  var next = tog(state)
  turn(lamp, next)
  $.get('/'+lamp.attr('id')+'/'+next)
}

function turn(lamp, state) {
  var other = tog(state)
  lamp.removeClass(other).addClass(state)
  lamp.data("light", state)
  lamp.find("img").removeClass(other).addClass(state)
}