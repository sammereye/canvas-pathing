let intersections = [];
let checks = 0;
let points = [];
let lines = [];
let currentLine = {
  id: crypto.randomUUID(),
  path: []
};
let pointDistance = 60;

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
        
        if ((backPoint.x === newPoint.x && backPoint.y === newPoint.y) || (forwardPoint.x === lastPoint.x && forwardPoint.y === lastPoint.y)) {
          console.log('skipped');
          continue;
        }
        
        let intersectingPoint = intersects(backPoint.x, backPoint.y, forwardPoint.x, forwardPoint.y, lastPoint.x, lastPoint.y, newPoint.x, newPoint.y);
        if (intersectingPoint) {
          let intersectingPointId = crypto.randomUUID();
          intersections.push({
            id: intersectingPointId,
            points: [
              backPoint.id,
              forwardPoint.id,
              lastPoint.id,
              newPoint.id
            ]
          });
          
          points.push({
            id: intersectingPointId,
            x: intersectingPoint.x,
            y: intersectingPoint.y,
            adjacentPoints: [
              backPoint.id,
              forwardPoint.id,
              lastPoint.id,
              newPoint.id
            ]
          });

          newPoint.adjacentPoints.push(intersectingPointId);
          lastPoint.adjacentPoints.push(intersectingPointId);
          backPoint.adjacentPoints.push(intersectingPointId);
          forwardPoint.adjacentPoints.push(intersectingPointId);
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
  let lastPoint = null;
  let nextPointId = null;

  var canvas = createCanvas(container, width, height);
  var ctx = canvas.context;

  ctx.clearTo = function(fillColor) {
    ctx.fillStyle = fillColor;
    ctx.fillRect(0, 0, width, height);
  };
  ctx.clearTo(fillColor || "#ddd");


  // bind mouse events
  canvas.node.onmousemove = function(e) {
    var x = e.pageX - this.offsetLeft;
    var y = e.pageY - this.offsetTop;

    if (lastPoint === null) {
      lastPoint = {
        id: null,
        x: null,
        y: null,
        adjacentPoints: []
      }
    }

    document.getElementById("x").textContent = x;
    document.getElementById("y").textContent = y;

    if (!canvas.isDrawing) {
      return;
    }

    if (getDistanceBetweenTwoPoints(lastPoint.x, lastPoint.y, x, y) > pointDistance) {
      let newPointId = nextPointId;
      nextPointId = crypto.randomUUID();
      let newPoint = {
        id: newPointId,
        x,
        y,
        adjacentPoints: [
          lastPoint.id,
          nextPointId
        ].filter(x => x)
      }
      
      checkForIntersections(lastPoint, newPoint, [...lines, currentLine]);
      currentLine.path.push(lastPoint)
      ctx.beginPath();
      ctx.moveTo(lastPoint.x, lastPoint.y);
      ctx.lineTo(x, y);
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 3;
      ctx.lineJoin = ctx.lineCap = 'round';
      ctx.stroke();
      lastPoint = newPoint
    }
  };

  canvas.node.onmousedown = function(e) {
    var x = e.pageX - this.offsetLeft;
    var y = e.pageY - this.offsetTop;
    nextPointId = crypto.randomUUID();
    lastPoint = {
      id: crypto.randomUUID(),
      x,
      y,
      adjacentPoints: [
        nextPointId
      ]
    }

    canvas.isDrawing = true;
  };

  canvas.node.onmouseup = function(e) {
    canvas.isDrawing = false;
    currentLine.path.push(lastPoint)

    lines.push(currentLine);
    // remove last id from last point
    currentLine.path[currentLine.path.length - 1].adjacentPoints.pop()
    points = [...points, ...currentLine.path];
    currentLine = {
      id: crypto.randomUUID(),
      path: []
    };
    lastPoint = null;
    nextPointId = null;
    console.log(points.map(x => x.adjacentPoints.length));
  };

  document.getElementById("moveCircle").onclick = async () => {
    if (lines.length > 0) {
      let line = lines[0];
      let path = line.path;
      let skipFirst = false;
      for (let i = 0; i < path.length; i++ ) {
        if (i + 1 < path.length) {
          let point1 = path[i];
          let point2 = path[i + 1];
          
          let speed = 20;
          let circleX = point1.x;
          let circleY = point1.y;
          let xDirection = point2.x > point1.x ? 1 : -1;
          let yDirection = point2.y > point1.y ? 1 : -1;
          const lineVec = getLineNormal(point1.x, point1.y, point2.x, point2.y);
  
          let j = 0;
          do {
            if (!(skipFirst && j === 0)) {
              let c1 = new Path2D;
              c1.arc(circleX, circleY, 6, 0, 2 * Math.PI);
              if (isPointAtIntersection(point1, point2)) {
                ctx.fillStyle = "red";
              } else {
                ctx.fillStyle = "darkslategrey";
              }
              ctx.fill(c1);
    
              let newCircleX = circleX + lineVec.x * speed;
              if ((newCircleX >= point2.x && xDirection === 1) || (newCircleX <= point2.x && xDirection === -1)) {
                circleX = point2.x;
              } else {
                circleX = newCircleX;
              }
    
              let newCircleY = circleY + lineVec.y * speed;
              if ((newCircleY >= point2.y && yDirection === 1) || (newCircleY <= point2.y && yDirection === -1)) {
                circleY = point2.y;
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
          } while (!(circleX === point2.x && circleY === point2.y))
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

function isPointAtIntersection(point1, point2) {
  return intersections.filter(intersection => intersection.points.includes(point1.id) && intersection.points.includes(point2.id)).length > 0;
  // return lines.filter(line => line.path.filter(point => point.id === point1.id || point.id === point2.id).length > 0).length > 0
}