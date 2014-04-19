var getMedia = require('getusermedia');

var video = document.querySelector('video');
var canvas = document.querySelector('canvas');
var ctx = canvas.getContext('2d');

getMedia({ video: true, audio: false }, function (err, media) {
    if (err) return console.error(err);
    video.src = window.URL.createObjectURL(media);
    video.play();
    frame();
});

function frame () {
    ctx.drawImage(video, 0, 0, video.width, video.height);
    var im = ctx.getImageData(0, 0, video.width, video.height);
    var data = im.data;
    for (var i = 0; i < data.length; i += 4) {
        var x = i % video.width;
        var y = Math.floor(i / video.width);
        data[i+1] = (data[i+1] + data[offset(x-5,y+5)+1]) / 2;
    }
    ctx.putImageData(im, 0, 0);
    window.requestAnimationFrame(frame);
    
    function offset (x, y) {
        return x + y * video.width;
    }
}
