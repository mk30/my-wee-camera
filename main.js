var vdom = require('virtual-dom')
var h = require('virtual-hyperscript-hook')(vdom.h)
var main = require("main-loop")
var getMedia = require('getusermedia');
var video
var canvas = document.createElement('canvas');
var capture = document.querySelector('#capture');
var show = document.querySelector('#show');
var ctx = canvas.getContext('2d');
var level = require('level-browserify');
var db = level('album', { valueEncoding: 'json' });
var through = require('through');
var createVideo = function (video) {
  getMedia({ video: true, audio: false }, function (err, media) {
    if (err) return console.error(err);
    video.src = window.URL.createObjectURL(media);
    video.play();
  });
}

var initState = {photos: []}

var loop = main(initState, render, require("virtual-dom"));

document.body.appendChild(loop.target)

function render (state) {
  function onclick () {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    var dataurl = canvas.toDataURL();
    var data = dataurl.replace(/^.+,/g, "");
    var time = new Date().toISOString();
    var w = db.put(time, data, function(){
    }); 
    loop.state.photos.push({
      'time': time,
      'data': data
    });
    loop.update(loop.state);
  }
  return h('div', [
    h('video', {
      width: 300,
      height: 200, 
      hook: function (elem){
        if (video) return; 
        video = elem;
        createVideo(video);
        console.log(video.width, video.height);
        canvas.width = video.width;
        canvas.height = video.height;
      }
    }),
    h('h1', 'hello'),
    h('button', { onclick: onclick }, 'take a picture'),
    h('div', state.photos.map(function(p){
      return h('div', [
        h('img', { src: 'data:image/jpeg;base64,' + p.data
        }),
        h('div', 'date: ' + p.time)
      ])
    }))
  ]);
}


db.createReadStream().pipe(through(write, end));
function write (data) {
  loop.state.photos.push({
    'time': data.key,
    'data': data.value
  });
  loop.update(loop.state);
}
function end () {
  console.log('__END__');
} 
