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

var initState = {
  photos: [], 
  rightwidth: 300
}

var loop = main(initState, render, require("virtual-dom"));

document.body.appendChild(loop.target)

function render (state) {
  function takepic () {
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
  };
  function camview () {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  }
  return h('div#wrapper', [
    h('div#top', {
      style: {
        width: '100%',
        'border-bottom': '1px solid #000000',
        background: 'Lavender'
      }
    }, [
      'my wee camera'

    ]),
    h('div#left', {
      style: {
        width: 
          window.innerWidth - state.rightwidth- 20
      }
    }, [
      h('video', {
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
      }),
      h('div', {
        style: {
          'clear': 'both',
          'width': '100%',
          'padding': '10px'
        },
      }, [
        h('button', { 
          onclick: takepic,
        }, 'take a picture'),
        h('button', { 
          onclick: camview,
        }, 'return to camera view'),
      ]),
    ]),
    h('div#right', {style : {width: state.rightwidth } }, [
      h('div', state.photos.map(function(p){
        return h('div', [
          h('img', { 
            src: 'data:image/jpeg;base64,' + p.data,
            style: {width: '100%'}
          }),
          h('div', 'date: ' + p.time)
        ])
      }))
    ])  
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
