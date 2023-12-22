let isDrawing = false;
let mousePosX = 0;
let mousePosY = 0;

// var points = [
//   new Two.Vector(20, 20),
//   new Two.Vector(40, 30),
//   new Two.Vector(100, 40),
// ];

let two = new Two({
  fullscreen: false
}).appendTo(document.body);

// let curve = two.makeCurve(20, 20, 40, 30, 100, 40, true);
// curve.stroke = "black";
// curve.linewidth = 10;
// curve.cap = "round"
// curve.automatic = true;

var points = [];
var M = new Two.Anchor(50, 50);
var O = new Two.Anchor(300, 100);
var L = new Two.Anchor(300, 600);

M.command = Two.Commands.move;
O.command = Two.Commands.curve;
L.command = Two.Commands.curve;

points.push(M);
points.push(O);
points.push(L);

var path = new Two.Path(points, false, true, false);
path.linewidth = 5;
path.cap = "round";
two.add(path)

two.bind('update', update);
two.play();

document.body.onmousedown = () => {
  isDrawing = true;
}

document.body.onmousemove = (evt) => {
  mousePosX = evt.pageX;
  mousePosY = evt.pageY;
}

document.body.onmouseup = () => {
  isDrawing = false;
  var newAnchor = new Two.Anchor(mousePosX, mousePosY);
  newAnchor.command = Two.Commands.curve;
  points.push(newAnchor);
  path.vertices = points;
}

function update(frameCount) {
  if (isDrawing) {
    if (path.vertices.length > points.length) {
      path.vertices.splice(points.length)
    }

    var newAnchor = new Two.Anchor(mousePosX, mousePosY);
    newAnchor.command = Two.Commands.curve;
    path.vertices.push(newAnchor);
  }
}

document.getElementById("btn").onclick = () => {
  console.log(path.getTotalLength());
}