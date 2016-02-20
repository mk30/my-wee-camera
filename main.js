var vdom = require('virtual-dom');
var h = require('virtual-hyperscript-hook')(vdom.h);
var main = require("main-loop");
var getMedia = require('getusermedia');
var randombytes = require('randombytes');
var video;
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
/*
var displaymodes = {
  camera: function () {},
  display: function () {}
}
*/

var initState = {
  photos: {}, 
  rightwidth: 300,
  displaymode: 'camera'
}

var loop = main(initState, render, require("virtual-dom"));

document.body.appendChild(loop.target)

function render (state) {
  function takepic () {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    var dataurl = canvas.toDataURL();
    var data = dataurl.replace(/^.+,/g, "");
    var time = new Date().toISOString();
    var w = db.put(time, data, function(){}); 
    var rand = randombytes(16).toString('hex');
    loop.state.photos[rand] = {
      'time': time,
      'data': data
    };
    loop.update(loop.state);
  };
  function camview () {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  }
  function picview (p){
    var url = 'data:image/jpeg;base64,' + state.photos[p].data;
    return  h('div#picview', {}, [
      h('a', {href: '#'}, [
        h('img', {src: url}),
      ]),
    ])
  }
  function rendercam () {
    return h('video', {
      width: 600,
      height: 400, 
      style: {
        'padding': '10px',
      },
      hook: function (elem){
        if (video) return; 
        video = elem;
        createVideo(video);
        canvas.width = video.width;
        canvas.height = video.height;
      }
    })
  }
  function clicked () {
      loop.state.displaymode = 'display';
      loop.update(loop.state);
      console.log(loop.state.displaymode)
  }
  var maindisplay
  if (state.displaymode == 'camera'){
    maindisplay = rendercam()
  }
  else if (state.displaymode == 'display'){
    maindisplay = picview()
  }
      //flow control based on loop.state.displaymode('display') goes here
  return h('div#wrapper', [
    h('div#top', { }, [
      'my wee camera'
    ]),
    h('div#left', {
      style: {
        width: 
          window.innerWidth - state.rightwidth- 20
      }
    }, [
      maindisplay,
      h('div#buttons', { }, [
        h('button', { 
          onclick: takepic,
        }, 'take a picture'),
        h('button', { 
          onclick: camview,
        }, 'return to camera view'),
      ]),
    ]),
    h('div#right', {style : {width: state.rightwidth } }, [
      h('div', Object.keys(state.photos).map(function(p){
        return h('div', [
          h('img', { 
            src: 'data:image/jpeg;base64,' + state.photos[p].data,
            onclick: clicked,
            style: {width: '100%'}
          }),
          h('div', 'id: ' + p)
        ])
      }))
    ])  
  ]);
}

db.createReadStream().pipe(through(write, end));
function write (data) {
  loop.state.photos[randombytes(16).toString('hex')] = {
    'time': data.key,
    'data': data.value
  };
  loop.update(loop.state);
}
function end () {
  console.log('__END__');
} 
