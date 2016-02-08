var getMedia = require('getusermedia');
var video = document.querySelector('video');
var canvas = document.querySelector('canvas');
var capture = document.querySelector('#capture');
var show = document.querySelector('#show');
var ctx = canvas.getContext('2d');
var level = require('level-browserify');
var db = level('album', { valueEncoding: 'json' });
var through = require('through');

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
        var x = i / 4 % video.width;
        var y = Math.floor(i / 4 / video.width);
        data[i+1] = (
            data[i+15] + 500 *
            Math.sin(data[offset(x-y,y-x)])
        );
    }
    ctx.putImageData(im, 0, 0);
    window.requestAnimationFrame(frame);
    
    function offset (x, y) {
        return x + y * video.width;
    }
}

capture.addEventListener("click", function(){
    var x = canvas.toDataURL();
    var y = x.replace(/^.+,/g, "")
    var w = db.put(new Date().toISOString(), y, function(){
        console.log('yelp');
    }); 
});

show.addEventListener("click", function(){
    db.createReadStream().pipe(through(write, end));
    function write (buf) {
        console.log(buf);
        var url = (
            "data:image/jpeg;base64," + buf.value 
        );
        var img = document.createElement('img');
        img.src = url;
        document.body.appendChild(img);
    }
    function end () {
        console.log('__END__');
    }
});
