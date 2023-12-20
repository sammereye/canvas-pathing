let intersections = [];
let checks = 0;
let lines = [];
let currentLine = {
  id: crypto.randomUUID(),
  path: []
};
let pointDistance = 10;

function getDistanceBetweenTwoPoints(x1, y1, x2, y2) {
  return Math.hypot(x2 - x1, y2 - y1);
}

function intersects(p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y) {
  var d1x = p1x - p0x,
    d1y = p1y - p0y,
    d2x = p3x - p2x,
    d2y = p3y - p2y,

    // determinator
    d = d1x * d2y - d2x * d1y,
    px, py, s, t;

  // continue if intersecting/is not parallel
  if (d) {

    px = p0x - p2x;
    py = p0y - p2y;

    s = (d1x * py - d1y * px) / d;
    if (s >= 0 && s <= 1) {

      // if s was in range, calc t
      t = (d2x * py - d2y * px) / d;
      if (t >= 0 && t <= 1) {
        return {
          x: p0x + (t * d1x),
          y: p0y + (t * d1y)
        }
      }
    }
  }
  return null
}

function checkForIntersections(lastPoint, newPoint, lines) {
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    let path = line.path;
    
    for (let j = 0; j < path.length; j++) {
      if (j + 1 < path.length) {
        const backPoint = path[j];
        const forwardPoint = path[j + 1];

        // console.log([backPoint.x, backPoint.y, forwardPoint.x, forwardPoint.y, lastPoint.x, lastPoint.y, newPoint.x, newPoint.y])
        
        if (forwardPoint.x === lastPoint.x && forwardPoint.y === lastPoint.y) {
          console.log('skipped');
          continue;
        }
        
        let intersectingPoint = intersects(backPoint.x, backPoint.y, forwardPoint.x, forwardPoint.y, lastPoint.x, lastPoint.y, newPoint.x, newPoint.y);
        if (intersectingPoint && !intersections.includes([intersectingPoint.x, intersectingPoint.y].join(","))) {
          intersections.push([intersectingPoint.x, intersectingPoint.y].join(","));
          console.log([backPoint.x, backPoint.y, forwardPoint.x, forwardPoint.y, lastPoint.x, lastPoint.y, newPoint.x, newPoint.y])
          document.getElementById("intersections").textContent = parseInt(document.getElementById("intersections").textContent) + 1;
        }
      }
    }
  }
}

function createCanvas(parent, width, height) {
  var canvas = {};
  canvas.node = document.createElement('canvas');
  canvas.context = canvas.node.getContext('2d');
  canvas.node.width = width || 100;
  canvas.node.height = height || 100;
  parent.appendChild(canvas.node);
  return canvas;
}

function init(container, width, height, fillColor) {
  let lastPoint = {
    x: null,
    y: null,
  }

  var canvas = createCanvas(container, width, height);
  var ctx = canvas.context;

  ctx.clearTo = function(fillColor) {
    ctx.fillStyle = fillColor;
    ctx.fillRect(0, 0, width, height);
  };
  ctx.clearTo(fillColor || "#ddd");

  /* // define a custom fillCircle method
  ctx.fillCircle = function(x, y, radius, fillColor) {
    this.fillStyle = fillColor;
    this.beginPath();
    this.moveTo(x, y);
    this.arc(x, y, radius, 0, Math.PI * 2, false);
    this.fill();
  }; */


  // bind mouse events
  canvas.node.onmousemove = function(e) {
    var x = e.pageX - this.offsetLeft;
    var y = e.pageY - this.offsetTop;

    if (lastPoint.x === null) {
      lastPoint.x = x;
      lastPoint.y = y;
    }

    document.getElementById("x").textContent = x;
    document.getElementById("y").textContent = y;

    if (!canvas.isDrawing) {
      return;
    }

    if (getDistanceBetweenTwoPoints(lastPoint.x, lastPoint.y, x, y) > pointDistance) {
      let newPoint = {
        id: crypto.randomUUID(),
        x: lastPoint.x,
        y: lastPoint.y
      }

      checkForIntersections(lastPoint, newPoint, [...lines, currentLine]);
      currentLine.path.push(newPoint)
      ctx.beginPath();
      ctx.moveTo(lastPoint.x, lastPoint.y);
      ctx.lineTo(x, y);
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 3;
      ctx.lineJoin = ctx.lineCap = 'round';
      ctx.stroke();
      lastPoint.x = x;
      lastPoint.y = y;
    }
  };

  canvas.node.onmousedown = function(e) {
    var x = e.pageX - this.offsetLeft;
    var y = e.pageY - this.offsetTop;
    lastPoint.x = x;
    lastPoint.y = y;

    canvas.isDrawing = true;
  };

  canvas.node.onmouseup = function(e) {
    canvas.isDrawing = false;
    currentLine.path.push({
      x: lastPoint.x,
      y: lastPoint.y
    })

    lines.push(currentLine);
    currentLine = {
      id: crypto.randomUUID(),
      path: []
    };
    lastPoint.x = null;
    lastPoint.y = null;
  };

  document.getElementById("moveCircle").onclick = async () => {
    if (lines.length > 0) {
      let line = lines[0];
      let path = line.path;
      let skipFirst = false;
      for (let i = 0; i < path.length; i++ ) {
        if (i + 1 < path.length) {
          let p1 = path[i];
          let p2 = path[i + 1];
          
          let speed = 20;
          let circleX = p1.x;
          let circleY = p1.y;
          let xDirection = p2.x > p1.x ? 1 : -1;
          let yDirection = p2.y > p1.y ? 1 : -1;
          const lineVec = getLineNormal(p1.x, p1.y, p2.x, p2.y);
  
          let j = 0;
          do {
            if (!(skipFirst && j === 0)) {
              let c1 = new Path2D;
              c1.arc(circleX, circleY, 6, 0, 2 * Math.PI);
              ctx.fillStyle = "darkslategrey";
              ctx.fill(c1);
    
              let newCircleX = circleX + lineVec.x * speed;
              if ((newCircleX >= p2.x && xDirection === 1) || (newCircleX <= p2.x && xDirection === -1)) {
                circleX = p2.x;
              } else {
                circleX = newCircleX;
              }
    
              let newCircleY = circleY + lineVec.y * speed;
              if ((newCircleY >= p2.y && yDirection === 1) || (newCircleY <= p2.y && yDirection === -1)) {
                circleY = p2.y;
              } else {
                circleY = newCircleY;
              }
    
              await sleep(7);
              ctx.clearTo("#ddd");
              let svgPath = createSvgPathFromPath(path);
              let p1 = new Path2D(svgPath);
              ctx.strokeStyle = "black";
              ctx.lineWidth = 3
              ctx.stroke(p1);

              if (!skipFirst) {
                skipFirst = true;
              }
            }

            j++;
          } while (!(circleX === p2.x && circleY === p2.y))
        }
      }
    }
  };
}

var container = document.getElementById('canvas');
init(container, 800, 400, '#ddd');

const sleep = ms => new Promise(r => setTimeout(r, ms));

function getLineNormal(x1, y1, x2, y2) {
  // get the line vector
  const vx = x2 - x1
  const vy = y2 - y1

  // get the line length
  const len = Math.hypot(vx, vy)

  // Only if the line has length
  if (len > 0) {
      // calculate normal of vector
      return {x: vx / len / 10, y: vy / len / 10}

  } 
  return {x: 0, y: 0}
}

function createSvgPathFromPath(path) {
  let svgString = "";
  for (let i = 0; i < path.length; i++) {
    if (i === 0) {
      svgString += "M";
    } else {
      svgString += "L";
    }

    svgString += `${path[i].x} ${path[i].y} `
  }

  return svgString;
}