var getMedia = require('getusermedia');
var video = document.querySelector('video');
var canvas = document.querySelector('canvas');
var butt = document.querySelector('#butt');
var ctx = canvas.getContext('2d');
var level = require('level-browserify');
var db = level('album', { valueEncoding: 'json' });
var blobstore = require('idb-content-addressable-blob-store');
var store = blobstore();

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

butt.addEventListener("click", function(){
    if (typeof canvas.toBlob !== "undefined"){
        canvas.toBlob(function(blob){
            console.log('x');
            /*
            var buf = new Buffer(FileReader.readAsArrayBuffer(blob));
            var w = store.createWriteStream(function (err, meta) {
                db.put(meta.key, {time: Date.now()}, function (err){
                    if (err) return console.log('Ooops!', err)
                });
            });
            w.end(buf);
            */
        })
    }
    else {console.log(canvas.toBlob())};
});
