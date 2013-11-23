$(function() {
  $('.text').on("click", function(e) {
    var lamp = $(e.currentTarget)
    toggle(lamp.data("light"), lamp)
  });
  $(".container").swipe({
    swipeLeft:function(event, direction, distance, duration, fingerCount) {
      //This only fires when the user swipes left
      window.location = "/video"
    },
    swipeRight:function(event, direction, distance, duration, fingerCount) {
      //This only fires when the user swipes left
      window.location = "/"
    }
  });
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