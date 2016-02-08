var mainLoop = require("main-loop")
var h = require("virtual-dom/h")

var initState = []

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

// set up a loop
var loop = mainLoop(initState, render, require("virtual-dom"));

document.body.appendChild(loop.target)

// update the loop with the new application state
loop.update({
    fruits: ["apple", "banana", "cherry"],
    name: "Steve"
})
loop.update({
    fruits: ["apple", "banana", "cherry"],
    name: "Stevie"
})
