//// UTILS

// logs a message to the console
const log = (msg) => console.log(msg);

// logs a message once only in the event loop
class EventLogger {
  constructor () {
    this.eventLogMsgFired = false;
  }

  log (msg) {
    if (this.eventLogMsgFired) {
      return;
    }
    log(msg);
    this.eventLogMsgFired = true;
  }
}

const eventLogger = new EventLogger();

// returns a random value from an array
const randomFromArray = (array) =>
  array[Math.floor(Math.random() * array.length)];

//// SVG Parser

class SVGParser {
  constructor (svgSource) {
    this.svgSource = svgSource;
    // returns a SVGDocument, which is also a Document.
    this.svgDocument = (new DOMParser()).parseFromString(svgSource, "image/svg+xml");
    this.svgNode = this.svgDocument.getElementsByTagName("svg")[0];
    log(this.svgDocument);
    this.svgData = {
      svgNode: this.svgNode,
      circleNodes: this.htmlCollectionToArray(this.svgDocument.getElementsByTagName("circle")),
      viewboxWidth: this.svgNode.viewBox.baseVal.width,
      viewboxHeight: this.svgNode.viewBox.baseVal.height
    }
  }

  htmlCollectionToArray (htmlCollection) {
    return [].slice.call(htmlCollection);
  }
}

//// TIMBRE.JS - http://mohayonao.github.io/timbre.js/GettingStarted.html

class MusicMachine {
  constructor (Timbre) {
    this.Timbre = Timbre;
    this.notes = {
      A: 440,
      Cs: 554.364,
      E: 659.255,
      Gs: 830.609
    };
    this.frequencies = Object.keys(this.notes).map((k) => this.notes[k]);
  }

  sinFromFreq (freq) {
    let sinOptions = {freq: freq, mul: 0.5};
    return this.Timbre("sin", sinOptions);
  }

  playPerc (freq1, freq2) {
    let percOptions = {r: 500};
    this.Timbre("perc", percOptions, this.sinFromFreq(freq1), this.sinFromFreq(freq2)).bang().play();
  }
}

//// SOUND COLLIDER
//// MATTER.JS - http://brm.io/matter-js/

class SoundCollider {
  constructor (width, height, Matter, MusicMachine) {
    this.MusicMachine = MusicMachine;
    this.Matter = Matter;
    this.Engine = Matter.Engine;
    this.World = Matter.World;
    this.Body = Matter.Body;
    this.Bodies = Matter.Bodies;
    this.Common = Matter.Common;
    this.Composites = Matter.Composites;
    this.Composite = Matter.Composite;
    this.Events = Matter.Events;
    this.MouseConstraint = Matter.MouseConstraint;
    this.width = width;
    this.height = height;
    this.canvas = null;
    this.engine = this.Engine.create(document.body, {
      render: {
        options: {
          showAngleIndicator: true,
          wireframes: false,
          width: this.width,
          height: this.height
        }
      }
    });
  }

  setup () {
    // render canvas
    this.canvas = this.engine.render.canvas;

    // gravity settings
    this.engine.world.gravity.x = 0;
    this.engine.world.gravity.y = 0;

    // add a mouse controlled constraint
    this.mouseConstraint = this.MouseConstraint.create(this.engine);
    this.World.add(this.engine.world, this.mouseConstraint);

    this.addWalls();
    this.addEventLoop();
  }

  addEventLoop () {
    this.Events.on(this.engine, 'collisionStart', (event) => {
      // This is the animation loop
      // collisionStart provides a list of all pairs that have
      // started to collide in the current tick (if any)
      event.pairs.forEach((pair) => {
        pair.activeContacts.forEach((contact) => {
          const body = contact.vertex.body;
          eventLogger.log(body);
        });
        // Play music on colliding bodies
        this.MusicMachine.playPerc(pair.bodyA.freq, pair.bodyB.freq);
      });
    });
  }

  addWalls () {
    const offset = 5;

    const rectA = this.Bodies.rectangle(this.width / 2, -offset, this.width + 2 * offset, 50, {
      isStatic: true
    });
    rectA.freq = this.MusicMachine.notes.A;

    const rectCs = this.Bodies.rectangle(this.width / 2, this.height + offset, this.width + 2 * offset, 50, {
      isStatic: true
    });
    rectCs.freq = this.MusicMachine.notes.Cs;

    const rectE = this.Bodies.rectangle(this.width + offset, this.height / 2, 50, this.height + 2 * offset, {
      isStatic: true
    });
    rectE.freq = this.MusicMachine.notes.E;

    const rectGs = this.Bodies.rectangle(-offset, this.height / 2, 50, this.height + 2 * offset, {
      isStatic: true
    });
    rectGs.freq = this.MusicMachine.notes.Gs;

    this.World.add(this.engine.world, [
      rectA,
      rectCs,
      rectE,
      rectGs
    ]);
  }

  addCirclesFromSVGNodes (circleNodes) {
    circleNodes.forEach((circleNode) => {
      let x = circleNode.cx.baseVal.value;
      let y = circleNode.cy.baseVal.value;
      let radius = circleNode.r.baseVal.value;
      let color = circleNode.attributes.fill.value; // Why is this only on attributes?

      this.addCircle(x, y, radius, color);
    });
  }

  addCircle (x, y, radius, color, options = {}) {
    let defaultOptions = {
      frictionAir: 0,
      friction: 0.0001,
      restitution: 0.8,
      render: {
        fillStyle: color
      }
    };
    for (let attr in options) {
      defaultOptions[attr] = options[attr];
    }
    // Create Matter.js body
    let circle = this.Bodies.circle(x, y, radius, defaultOptions);
    // Add frequency
    circle.freq = randomFromArray(this.MusicMachine.frequencies);
    // Add circle to world
    this.World.add(this.engine.world, circle);
  }

  run () {
    this.Engine.run(this.engine);
  }
}


//// RUN PROGRAM

const SVG_SOURCE =
  `<?xml version="1.0" encoding="utf-8"?>
  <!-- Generator: Adobe Illustrator 19.0.0, SVG Export Plug-In . SVG Version: 6.00 Build 0)  -->
  <!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
  <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
     viewBox="0 0 792 612" enable-background="new 0 0 792 612" xml:space="preserve">
  <circle id="XMLID_1_" fill="#F1584A" cx="129.7" cy="91.3" r="36.3"/>
  <circle id="XMLID_2_" fill="#00A29A" cx="129.7" cy="192.4" r="9.8"/>
  <circle id="XMLID_3_" fill="#F1E4BA" cx="384.1" cy="150.4" r="76.7"/>
  <circle id="XMLID_4_" fill="#6BBAAA" cx="186.2" cy="312.1" r="81.3"/>
  <circle id="XMLID_5_" fill="#F9A464" cx="420.4" cy="312.1" r="16.1"/>
  <circle id="XMLID_6_" fill="#F1E4BA" cx="358.2" cy="441.1" r="55.4"/>
  <circle id="XMLID_7_" fill="#F9A464" cx="683.1" cy="66.5" r="14.5"/>
  <circle id="XMLID_8_" fill="#F1584A" cx="638.5" cy="220.9" r="78.2"/>
  <circle id="XMLID_9_" fill="#F1E4BA" cx="571.2" cy="390.3" r="9.3"/>
  <circle id="XMLID_10_" fill="#F9A464" cx="646.8" cy="519.3" r="83.9"/>
  <circle id="XMLID_11_" fill="#F9A464" cx="83.6" cy="483" r="24.9"/>
  <circle id="XMLID_12_" fill="#6BBAAA" cx="542.2" cy="62.8" r="7.8"/>
  <circle id="XMLID_13_" fill="#00A29A" cx="509" cy="233.3" r="3.1"/>
  <circle id="XMLID_14_" fill="#00A29A" cx="200.2" cy="507.9" r="50.8"/>
  <circle id="XMLID_15_" fill="#6BBAAA" cx="490.9" cy="470.1" r="7.3"/>
  <circle id="XMLID_16_" fill="#F1584A" cx="404.3" cy="549.4" r="25.9"/>
  <circle id="XMLID_17_" fill="#F9A464" cx="258.7" cy="66.5" r="14.5"/>
  <g id="XMLID_18_">
  </g>
  <g id="XMLID_19_">
  </g>
  <g id="XMLID_20_">
  </g>
  <g id="XMLID_21_">
  </g>
  <g id="XMLID_22_">
  </g>
  <g id="XMLID_23_">
  </g>
  </svg>`;

const svgParser = new SVGParser(SVG_SOURCE);
log(svgParser);

const musicMachine = new MusicMachine(T);

const soundCollider = new SoundCollider(
  svgParser.svgData.viewboxWidth,
  svgParser.svgData.viewboxHeight,
  Matter,
  musicMachine
);
log(soundCollider);

soundCollider.setup();
soundCollider.addCirclesFromSVGNodes(svgParser.svgData.circleNodes);
soundCollider.run();
