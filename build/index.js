const mix = document.getElementById("myAudio");

document.getElementById("startButton").addEventListener("click", function () {
  const overlay = document.getElementById("overlay");
  overlay.remove();

  mix.play();


});
