// Utils

// logs a message once only in the event loop
var eventLogMsgFired = false;
var eventLog = function(msg) {

  if (!eventLogMsgFired) {
    console.log(msg);
  }

  eventLogMsgFired = true;
};

// logs a message to the console
var log = function(msg) {
  console.log(msg);
};

var randomFromArray = function (array) {
  return array[Math.floor(Math.random() * array.length)];
};

// SVG Source
var SVG_SOURCE =
  "<?xml version=\"1.0\" encoding=\"utf-8\"?>" +
  "<!-- Generator: Adobe Illustrator 19.0.0, SVG Export Plug-In . SVG Version: 6.00 Build 0)  -->" +
  "<!DOCTYPE svg PUBLIC \"-//W3C//DTD SVG 1.1//EN\" \"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\">" +
  "<svg version=\"1.1\" id=\"Layer_1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\"" +
  "  viewBox=\"0 0 792 612\" enable-background=\"new 0 0 792 612\" xml:space=\"preserve\">" +
  "<circle id=\"XMLID_1_\" fill=\"#F1584A\" cx=\"129.7\" cy=\"91.3\" r=\"36.3\"/>" +
  "<circle id=\"XMLID_2_\" fill=\"#00A29A\" cx=\"129.7\" cy=\"192.4\" r=\"9.8\"/>" +
  "<circle id=\"XMLID_3_\" fill=\"#F1E4BA\" cx=\"384.1\" cy=\"150.4\" r=\"76.7\"/>" +
  "<circle id=\"XMLID_4_\" fill=\"#6BBAAA\" cx=\"186.2\" cy=\"312.1\" r=\"81.3\"/>" +
  "<circle id=\"XMLID_5_\" fill=\"#F9A464\" cx=\"420.4\" cy=\"312.1\" r=\"16.1\"/>" +
  "<circle id=\"XMLID_6_\" fill=\"#F1E4BA\" cx=\"358.2\" cy=\"441.1\" r=\"55.4\"/>" +
  "<circle id=\"XMLID_7_\" fill=\"#F9A464\" cx=\"683.1\" cy=\"66.5\" r=\"14.5\"/>" +
  "<circle id=\"XMLID_8_\" fill=\"#F1584A\" cx=\"638.5\" cy=\"220.9\" r=\"78.2\"/>" +
  "<circle id=\"XMLID_9_\" fill=\"#F1E4BA\" cx=\"571.2\" cy=\"390.3\" r=\"9.3\"/>" +
  "<circle id=\"XMLID_10_\" fill=\"#F9A464\" cx=\"646.8\" cy=\"519.3\" r=\"83.9\"/>" +
  "<circle id=\"XMLID_11_\" fill=\"#F9A464\" cx=\"83.6\" cy=\"483\" r=\"24.9\"/>" +
  "<circle id=\"XMLID_12_\" fill=\"#6BBAAA\" cx=\"542.2\" cy=\"62.8\" r=\"7.8\"/>" +
  "<circle id=\"XMLID_13_\" fill=\"#00A29A\" cx=\"509\" cy=\"233.3\" r=\"3.1\"/>" +
  "<circle id=\"XMLID_14_\" fill=\"#00A29A\" cx=\"200.2\" cy=\"507.9\" r=\"50.8\"/>" +
  "<circle id=\"XMLID_15_\" fill=\"#6BBAAA\" cx=\"490.9\" cy=\"470.1\" r=\"7.3\"/>" +
  "<circle id=\"XMLID_16_\" fill=\"#F1584A\" cx=\"404.3\" cy=\"549.4\" r=\"25.9\"/>" +
  "<circle id=\"XMLID_17_\" fill=\"#F9A464\" cx=\"258.7\" cy=\"66.5\" r=\"14.5\"/>" +
  "<g id=\"XMLID_18_\">" +
  "</g>" +
  "<g id=\"XMLID_19_\">" +
  "</g>" +
  "<g id=\"XMLID_20_\">" +
  "</g>" +
  "<g id=\"XMLID_21_\">" +
  "</g>" +
  "<g id=\"XMLID_22_\">" +
  "</g>" +
  "<g id=\"XMLID_23_\">" +
  "</g>" +
  "</svg>";

// returns a SVGDocument, which also is a Document.
var domParser = new DOMParser();
var svgDocument = domParser.parseFromString(SVG_SOURCE, "image/svg+xml");
log(svgDocument);

var htmlCollectionToArray = function (htmlCollection) {
  return [].slice.call(htmlCollection);
};

// Build up the SVG data I want
var svgData = {
  svgNode: svgDocument.getElementsByTagName("svg")[0],
  circleNodes: htmlCollectionToArray(svgDocument.getElementsByTagName("circle"))
};

var worldWidth = svgData.viewboxWidth = svgData.svgNode.viewBox.baseVal.width;
var worldHeight = svgData.viewboxHeight = svgData.svgNode.viewBox.baseVal.height;
log(svgData);


// Timbre.js - http://mohayonao.github.io/timbre.js/GettingStarted.html

var FREQ = {
  A: 440,
  Cs: 554.364,
  E: 659.255,
  Gs: 830.609
};

var FREQUENCIES = [
  440,
  554.364,
  659.255,
  830.609
];

var sinFromFreq = function(freq) {
  return T("sin", {
    freq: freq,
    mul: 0.5
  });
};

var playSin = function(freq) {
  sinFromFreq(freq).play();
};

var playPerc = function(freq1, freq2) {
  T("perc", {
      r: 500
    }, sinFromFreq(freq1), sinFromFreq(freq2))
    .bang().play();
};

// Matter.js - http://brm.io/matter-js/

// Shopify Yellow: #EBB129
// Shopify Green:  #76AC5B

// Matter module aliases
var Engine = Matter.Engine,
  World = Matter.World,
  Body = Matter.Body,
  Bodies = Matter.Bodies,
  Common = Matter.Common,
  Composites = Matter.Composites,
  Composite = Matter.Composite,
  Events = Matter.Events,
  MouseConstraint = Matter.MouseConstraint;

// create a Matter.js engine
var engine = Engine.create(document.body, {
  render: {
    options: {
      showAngleIndicator: true,
      wireframes: false,
      width: worldWidth,
      height: worldHeight
    }
  }
});

// grab the canvas element
var canvas = engine.render.canvas;

// gravity settings
engine.world.gravity.x = 0;
engine.world.gravity.y = 0;

// add a mouse controlled constraint
var mouseConstraint = MouseConstraint.create(engine);
World.add(engine.world, mouseConstraint);

Events.on(engine, 'collisionStart', function(event) {

  // This is the animation loop
  // collisionStart provides a list of all pairs that have
  // started to collide in the current tick (if any)

  event.pairs.forEach(function(pair) {

    pair.activeContacts.forEach(function(contact) {
      var body = contact.vertex.body;
      eventLog(body);
    });

    playPerc(pair.bodyA.freq, pair.bodyB.freq);

  });

});

var bodyOptions = {
  frictionAir: 0,
  friction: 0.0001,
  restitution: 0.8,
  render: {
    fillStyle: '#76AC5B'
  }
};

var createCircle = function (x, y, radius, color, freq, options) {
  var defaultOptions = {
    frictionAir: 0,
    friction: 0.0001,
    restitution: 0.8,
    render: {
      fillStyle: color
    }
  };

  if (!options) {
    options = {};
  }

  for (var attr in options) {
    defaultOptions[attr] = options[attr];
  }

  // Create Matter.js body
  var circle = Bodies.circle(x, y, radius, defaultOptions);

  // Add frequency
  circle.freq = randomFromArray(FREQUENCIES);

  // Add circle to world
  World.add(engine.world, circle);

  log(circle);
  return circle;
};



// Create circles with sounds
svgData.circleNodes.forEach(function (circleNode) {
  var x = circleNode.cx.baseVal.value;
  var y = circleNode.cy.baseVal.value;
  var radius = circleNode.r.baseVal.value;
  var color = circleNode.attributes.fill.value; // Why is this only on attributes?
  var freq = FREQ.A;

  createCircle(x, y, radius, color, freq);
});

// add some some walls to the world
var offset = 5;

var rectA = Bodies.rectangle(worldWidth / 2, -offset, worldWidth + 2 * offset, 50, {
  isStatic: true
});
rectA.freq = FREQ.A;

var rectCs = Bodies.rectangle(worldWidth / 2, worldHeight + offset, worldWidth + 2 * offset, 50, {
  isStatic: true
});
rectCs.freq = FREQ.Cs;

var rectE = Bodies.rectangle(worldWidth + offset, worldHeight / 2, 50, worldHeight + 2 * offset, {
  isStatic: true
});
rectE.freq = FREQ.E;

var rectGs = Bodies.rectangle(-offset, worldHeight / 2, 50, worldHeight + 2 * offset, {
  isStatic: true
});
rectGs.freq = FREQ.Gs;

World.add(engine.world, [
  rectA,
  rectCs,
  rectE,
  rectGs
]);

// run the engine
Engine.run(engine);
