var main = require("main-loop")
var h = require("virtual-dom/h")
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

var initState = {photos: []}

// set up a loop
var loop = mainLoop(initState, render, require("virtual-dom"));

document.body.appendChild(loop.target)


function render (state) {
  var dataurl = canvas.toDataURL();
  var data = dataurl.replace(/^.+,/g, "");
  var time = new Date().toISOString();
  function onclick () {
    var w = db.put(date, data, function(){
      console.log('screenshot captured');
    }); 
    loop.state.photos.push({
      'time': time,
      'data': data
    });
    loop.update(loop.state);
  }
  return h('div', [
    h('h1', 'hello'),
    h('button', { onclick: onclick }, 'take a picture')
  ]);
}





/*

function render(state) {
    return h("div", [
        h("div", [
            h("span", "hello "),
            h("img", 
        ]),
        h("ul", state.fruits.map(renderFruit))
    ])

    function renderFruit(fruitName) {
        return h("li", [
            h("span", fruitName)
        ])
    }
}


// update the loop with the new application state
loop.update({
    fruits: ["apple", "banana", "cherry"],
    name: "Steve"
})
loop.update({
    fruits: ["apple", "banana", "cherry"],
    name: "Stevie"
})

*/
