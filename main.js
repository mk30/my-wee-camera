var main = require("main-loop")
var h = require("virtual-dom/h")
var getMedia = require('getusermedia');
var video = document.querySelector('video');
var canvas = document.createElement('canvas');
canvas.width = video.width;
canvas.height = video.height;
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
});

var initState = {photos: []}

// set up a loop
var loop = main(initState, render, require("virtual-dom"));

document.body.appendChild(loop.target)

function render (state) {
  function onclick () {
    ctx.drawImage(video, 0, 0, video.width, video.height);
    var dataurl = canvas.toDataURL();
    var data = dataurl.replace(/^.+,/g, "");
    var time = new Date().toISOString();
    var w = db.put(time, data, function(){
      console.log('screenshot captured');
    }); 
    loop.state.photos.push({
      'time': time,
      'data': data
    });
    loop.update(loop.state);
    console.log(loop.state);
  }
  return h('div', [
    h('h1', 'hello'),
    h('button', { onclick: onclick }, 'take a picture'),
    h('div', state.photos.map(function(p){
      return h('div', [
        h('img', { src: 'data:image/jpeg;base64,' + p.data
        }),
        h('div', 'datA: ' + p.data),
        h('div', 'date: ' + p.time)
      ])
    }))
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
