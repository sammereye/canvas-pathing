let intersections = [];
let checks = 0;
let points = [];
let lines = [];
let currentLine = {
  id: crypto.randomUUID(),
  path: []
};
let pointDistance = 25;

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
          // intersections.push({
          //   id: intersectingPointId,
          //   points: [
          //     backPoint.id,
          //     forwardPoint.id,
          //     lastPoint.id,
          //     newPoint.id
          //   ]
          // });
          
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
    let lastPointId = currentLine.path[currentLine.path.length - 1].id;
    points = [...points, ...currentLine.path];
    points.filter(point => point.id === lastPointId)[0].adjacentPoints = points.filter(point => point.id === lastPointId)[0].adjacentPoints.filter(pointId => points.filter(point => point.id === pointId).length > 0)
    
    currentLine = {
      id: crypto.randomUUID(),
      path: []
    };
    lastPoint = null;
    nextPointId = null;
  };

  document.getElementById("moveCircle").onclick = async () => {
    let lastVisitedPoint = null;
    let nextPoint = null;
    let randomPoint = points[Math.floor(Math.random() * points.length)];
    let currentPoint = randomPoint;
    for (let i = 0; i < 100; i++) {
      let arrForNextPoint = currentPoint.adjacentPoints.filter(point => point !== lastVisitedPoint?.id);
      if (arrForNextPoint.length === 0) {
        arrForNextPoint = currentPoint.adjacentPoints;
      }

      let randomNextPointId = arrForNextPoint[Math.floor(Math.random() * arrForNextPoint.length)];
      nextPoint = points.filter(x => x.id === randomNextPointId)[0];

      let speed = 10;
      let circleX = currentPoint.x;
      let circleY = currentPoint.y;
      let xDirection = nextPoint.x > currentPoint.x ? 1 : -1;
      let yDirection = nextPoint.y > currentPoint.y ? 1 : -1;
      const lineVec = getLineNormal(currentPoint.x, currentPoint.y, nextPoint.x, nextPoint.y);

      let j = 0;
      do {
        let c1 = new Path2D;
        c1.arc(circleX, circleY, 6, 0, 2 * Math.PI);
        ctx.fillStyle = "darkslategrey";
        ctx.fill(c1);

        let newCircleX = circleX + lineVec.x * speed;
        if ((newCircleX >= nextPoint.x && xDirection === 1) || (newCircleX <= nextPoint.x && xDirection === -1)) {
          circleX = nextPoint.x;
        } else {
          circleX = newCircleX;
        }

        let newCircleY = circleY + lineVec.y * speed;
        if ((newCircleY >= nextPoint.y && yDirection === 1) || (newCircleY <= nextPoint.y && yDirection === -1)) {
          circleY = nextPoint.y;
        } else {
          circleY = newCircleY;
        }

        await sleep(7);
        ctx.clearTo("#ddd");
        // let svgPath = createSvgPathFromPath(path);
        // let p1 = new Path2D(svgPath);
        // ctx.strokeStyle = "black";
        // ctx.lineWidth = 3
        // ctx.stroke(p1);
      } while (!(circleX === nextPoint.x && circleY === nextPoint.y))

      lastVisitedPoint = currentPoint;
      currentPoint = nextPoint;
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