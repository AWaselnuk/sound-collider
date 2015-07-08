//// UTILS

// logs a message to the console
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _log = function _log(msg) {
  return console.log(msg);
};

// logs a message once only in the event loop

var EventLogger = (function () {
  function EventLogger() {
    _classCallCheck(this, EventLogger);

    this.eventLogMsgFired = false;
  }

  _createClass(EventLogger, [{
    key: "log",
    value: function log(msg) {
      if (this.eventLogMsgFired) {
        return;
      }
      _log(msg);
      this.eventLogMsgFired = true;
    }
  }]);

  return EventLogger;
})();

var eventLogger = new EventLogger();

// returns a random value from an array
var randomFromArray = function randomFromArray(array) {
  return array[Math.floor(Math.random() * array.length)];
};

//// SVG Parser

var SVGParser = (function () {
  function SVGParser(svgSource) {
    _classCallCheck(this, SVGParser);

    this.svgSource = svgSource;
    // returns a SVGDocument, which is also a Document.
    this.svgDocument = new DOMParser().parseFromString(svgSource, "image/svg+xml");
    this.svgNode = this.svgDocument.getElementsByTagName("svg")[0];
    _log(this.svgDocument);
    this.svgData = {
      svgNode: this.svgNode,
      circleNodes: this.htmlCollectionToArray(this.svgDocument.getElementsByTagName("circle")),
      viewboxWidth: this.svgNode.viewBox.baseVal.width,
      viewboxHeight: this.svgNode.viewBox.baseVal.height
    };
  }

  _createClass(SVGParser, [{
    key: "htmlCollectionToArray",
    value: function htmlCollectionToArray(htmlCollection) {
      return [].slice.call(htmlCollection);
    }
  }]);

  return SVGParser;
})();

//// TIMBRE.JS - http://mohayonao.github.io/timbre.js/GettingStarted.html

var MusicMachine = (function () {
  function MusicMachine(Timbre) {
    var _this = this;

    _classCallCheck(this, MusicMachine);

    this.Timbre = Timbre;
    this.notes = {
      A: 440,
      Cs: 554.364,
      E: 659.255,
      Gs: 830.609
    };
    this.frequencies = Object.keys(this.notes).map(function (k) {
      return _this.notes[k];
    });
  }

  _createClass(MusicMachine, [{
    key: "sinFromFreq",
    value: function sinFromFreq(freq) {
      var sinOptions = { freq: freq, mul: 0.5 };
      return this.Timbre("sin", sinOptions);
    }
  }, {
    key: "playPerc",
    value: function playPerc(freq1, freq2) {
      var percOptions = { r: 500 };
      this.Timbre("perc", percOptions, this.sinFromFreq(freq1), this.sinFromFreq(freq2)).bang().play();
    }
  }]);

  return MusicMachine;
})();

//// SOUND COLLIDER
//// MATTER.JS - http://brm.io/matter-js/

var SoundCollider = (function () {
  function SoundCollider(width, height, Matter, MusicMachine) {
    _classCallCheck(this, SoundCollider);

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

  _createClass(SoundCollider, [{
    key: "setup",
    value: function setup() {
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
  }, {
    key: "addEventLoop",
    value: function addEventLoop() {
      var _this2 = this;

      this.Events.on(this.engine, "collisionStart", function (event) {
        // This is the animation loop
        // collisionStart provides a list of all pairs that have
        // started to collide in the current tick (if any)
        event.pairs.forEach(function (pair) {
          pair.activeContacts.forEach(function (contact) {
            var body = contact.vertex.body;
            eventLogger.log(body);
          });
          // Play music on colliding bodies
          _this2.MusicMachine.playPerc(pair.bodyA.freq, pair.bodyB.freq);
        });
      });
    }
  }, {
    key: "addWalls",
    value: function addWalls() {
      var offset = 5;

      var rectA = this.Bodies.rectangle(this.width / 2, -offset, this.width + 2 * offset, 50, {
        isStatic: true
      });
      rectA.freq = this.MusicMachine.notes.A;

      var rectCs = this.Bodies.rectangle(this.width / 2, this.height + offset, this.width + 2 * offset, 50, {
        isStatic: true
      });
      rectCs.freq = this.MusicMachine.notes.Cs;

      var rectE = this.Bodies.rectangle(this.width + offset, this.height / 2, 50, this.height + 2 * offset, {
        isStatic: true
      });
      rectE.freq = this.MusicMachine.notes.E;

      var rectGs = this.Bodies.rectangle(-offset, this.height / 2, 50, this.height + 2 * offset, {
        isStatic: true
      });
      rectGs.freq = this.MusicMachine.notes.Gs;

      this.World.add(this.engine.world, [rectA, rectCs, rectE, rectGs]);
    }
  }, {
    key: "addCirclesFromSVGNodes",
    value: function addCirclesFromSVGNodes(circleNodes) {
      var _this3 = this;

      circleNodes.forEach(function (circleNode) {
        var x = circleNode.cx.baseVal.value;
        var y = circleNode.cy.baseVal.value;
        var radius = circleNode.r.baseVal.value;
        var color = circleNode.attributes.fill.value; // Why is this only on attributes?

        _this3.addCircle(x, y, radius, color);
      });
    }
  }, {
    key: "addCircle",
    value: function addCircle(x, y, radius, color) {
      var options = arguments[4] === undefined ? {} : arguments[4];

      var defaultOptions = {
        frictionAir: 0,
        friction: 0.0001,
        restitution: 0.8,
        render: {
          fillStyle: color
        }
      };
      for (var attr in options) {
        defaultOptions[attr] = options[attr];
      }
      // Create Matter.js body
      var circle = this.Bodies.circle(x, y, radius, defaultOptions);
      // Add frequency
      circle.freq = randomFromArray(this.MusicMachine.frequencies);
      // Add circle to world
      this.World.add(this.engine.world, circle);
    }
  }, {
    key: "run",
    value: function run() {
      this.Engine.run(this.engine);
    }
  }]);

  return SoundCollider;
})();

//// RUN PROGRAM

var SHOPIFY_LOGO_SOURCE = "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?>\n  <svg width=\"1024px\" height=\"1024px\" viewBox=\"0 0 1024 1024\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" xmlns:sketch=\"http://www.bohemiancoding.com/sketch/ns\">\n      <!-- Generator: Sketch 3.2.2 (9983) - http://www.bohemiancoding.com/sketch -->\n      <title>Desktop</title>\n      <desc>Created with Sketch.</desc>\n      <defs></defs>\n      <g id=\"Welcome\" stroke=\"none\" stroke-width=\"1\" fill=\"none\" fill-rule=\"evenodd\" sketch:type=\"MSPage\">\n          <g id=\"Desktop\" sketch:type=\"MSArtboardGroup\">\n              <circle id=\"Oval-1\" fill=\"#5E8E3E\" sketch:type=\"MSShapeGroup\" cx=\"596\" cy=\"310\" r=\"4\"></circle>\n              <circle id=\"Oval-1\" fill=\"#5E8E3E\" sketch:type=\"MSShapeGroup\" cx=\"612\" cy=\"329\" r=\"4\"></circle>\n              <circle id=\"Oval-1\" fill=\"#5E8E3E\" sketch:type=\"MSShapeGroup\" cx=\"623\" cy=\"337\" r=\"4\"></circle>\n              <circle id=\"Oval-1\" fill=\"#5E8E3E\" sketch:type=\"MSShapeGroup\" cx=\"637\" cy=\"340\" r=\"4\"></circle>\n              <circle id=\"Oval-1\" fill=\"#5E8E3E\" sketch:type=\"MSShapeGroup\" cx=\"649\" cy=\"340\" r=\"4\"></circle>\n              <circle id=\"Oval-1\" fill=\"#5E8E3E\" sketch:type=\"MSShapeGroup\" cx=\"663\" cy=\"340\" r=\"4\"></circle>\n              <circle id=\"Oval-1\" fill=\"#5E8E3E\" sketch:type=\"MSShapeGroup\" cx=\"616.5\" cy=\"364.5\" r=\"22.5\"></circle>\n              <circle id=\"Oval-1\" fill=\"#5E8E3E\" sketch:type=\"MSShapeGroup\" cx=\"659\" cy=\"503\" r=\"24\"></circle>\n              <circle id=\"Oval-1\" fill=\"#5E8E3E\" sketch:type=\"MSShapeGroup\" cx=\"600\" cy=\"685\" r=\"24\"></circle>\n              <circle id=\"Oval-1\" fill=\"#5E8E3E\" sketch:type=\"MSShapeGroup\" cx=\"644\" cy=\"600\" r=\"52\"></circle>\n              <circle id=\"Oval-1\" fill=\"#5E8E3E\" sketch:type=\"MSShapeGroup\" cx=\"592\" cy=\"539\" r=\"12\"></circle>\n              <circle id=\"Oval-1\" fill=\"#5E8E3E\" sketch:type=\"MSShapeGroup\" cx=\"600\" cy=\"429\" r=\"12\"></circle>\n              <circle id=\"Oval-1\" fill=\"#5E8E3E\" sketch:type=\"MSShapeGroup\" cx=\"633.5\" cy=\"398.5\" r=\"12.5\"></circle>\n              <circle id=\"Oval-1\" fill=\"#5E8E3E\" sketch:type=\"MSShapeGroup\" cx=\"622.5\" cy=\"420.5\" r=\"8.5\"></circle>\n              <circle id=\"Oval-1\" fill=\"#5E8E3E\" sketch:type=\"MSShapeGroup\" cx=\"642.5\" cy=\"423.5\" r=\"8.5\"></circle>\n              <circle id=\"Oval-1\" fill=\"#5E8E3E\" sketch:type=\"MSShapeGroup\" cx=\"653.5\" cy=\"407.5\" r=\"5.5\"></circle>\n              <circle id=\"Oval-1\" fill=\"#5E8E3E\" sketch:type=\"MSShapeGroup\" cx=\"669.5\" cy=\"404.5\" r=\"5.5\"></circle>\n              <circle id=\"Oval-1\" fill=\"#5E8E3E\" sketch:type=\"MSShapeGroup\" cx=\"605.5\" cy=\"451.5\" r=\"8.5\"></circle>\n              <circle id=\"Oval-1\" fill=\"#5E8E3E\" sketch:type=\"MSShapeGroup\" cx=\"595.5\" cy=\"469.5\" r=\"8.5\"></circle>\n              <circle id=\"Oval-1\" fill=\"#5E8E3E\" sketch:type=\"MSShapeGroup\" cx=\"639.5\" cy=\"472.5\" r=\"8.5\"></circle>\n              <circle id=\"Oval-1\" fill=\"#5E8E3E\" sketch:type=\"MSShapeGroup\" cx=\"668.5\" cy=\"468.5\" r=\"8.5\"></circle>\n              <circle id=\"Oval-1\" fill=\"#5E8E3E\" sketch:type=\"MSShapeGroup\" cx=\"633.5\" cy=\"532.5\" r=\"8.5\"></circle>\n              <circle id=\"Oval-1\" fill=\"#5E8E3E\" sketch:type=\"MSShapeGroup\" cx=\"652.5\" cy=\"537.5\" r=\"8.5\"></circle>\n              <circle id=\"Oval-1\" fill=\"#5E8E3E\" sketch:type=\"MSShapeGroup\" cx=\"614.5\" cy=\"542.5\" r=\"8.5\"></circle>\n              <circle id=\"Oval-1\" fill=\"#5E8E3E\" sketch:type=\"MSShapeGroup\" cx=\"588.5\" cy=\"563.5\" r=\"8.5\"></circle>\n              <circle id=\"Oval-1\" fill=\"#5E8E3E\" sketch:type=\"MSShapeGroup\" cx=\"585.5\" cy=\"586.5\" r=\"5.5\"></circle>\n              <circle id=\"Oval-1\" fill=\"#5E8E3E\" sketch:type=\"MSShapeGroup\" cx=\"584.5\" cy=\"604.5\" r=\"5.5\"></circle>\n              <circle id=\"Oval-1\" fill=\"#5E8E3E\" sketch:type=\"MSShapeGroup\" cx=\"583.5\" cy=\"623.5\" r=\"5.5\"></circle>\n              <circle id=\"Oval-1\" fill=\"#5E8E3E\" sketch:type=\"MSShapeGroup\" cx=\"582.5\" cy=\"645.5\" r=\"5.5\"></circle>\n              <circle id=\"Oval-1\" fill=\"#5E8E3E\" sketch:type=\"MSShapeGroup\" cx=\"604.5\" cy=\"652.5\" r=\"5.5\"></circle>\n              <circle id=\"Oval-1\" fill=\"#5E8E3E\" sketch:type=\"MSShapeGroup\" cx=\"636.5\" cy=\"669.5\" r=\"11.5\"></circle>\n              <circle id=\"Oval-1\" fill=\"#5E8E3E\" sketch:type=\"MSShapeGroup\" cx=\"672.5\" cy=\"661.5\" r=\"11.5\"></circle>\n              <circle id=\"Oval-1\" fill=\"#5E8E3E\" sketch:type=\"MSShapeGroup\" cx=\"688\" cy=\"685\" r=\"8\"></circle>\n              <circle id=\"Oval-1\" fill=\"#5E8E3E\" sketch:type=\"MSShapeGroup\" cx=\"699\" cy=\"638\" r=\"11\"></circle>\n              <circle id=\"Oval-1\" fill=\"#5E8E3E\" sketch:type=\"MSShapeGroup\" cx=\"702\" cy=\"618\" r=\"5\"></circle>\n              <circle id=\"Oval-1\" fill=\"#5E8E3E\" sketch:type=\"MSShapeGroup\" cx=\"695\" cy=\"564\" r=\"5\"></circle>\n              <circle id=\"Oval-1\" fill=\"#5E8E3E\" sketch:type=\"MSShapeGroup\" cx=\"700\" cy=\"586\" r=\"5\"></circle>\n              <circle id=\"Oval-1\" fill=\"#5E8E3E\" sketch:type=\"MSShapeGroup\" cx=\"702\" cy=\"604\" r=\"5\"></circle>\n              <circle id=\"Oval-1\" fill=\"#5E8E3E\" sketch:type=\"MSShapeGroup\" cx=\"683\" cy=\"556\" r=\"5\"></circle>\n              <circle id=\"Oval-1\" fill=\"#5E8E3E\" sketch:type=\"MSShapeGroup\" cx=\"688\" cy=\"517\" r=\"5\"></circle>\n              <circle id=\"Oval-1\" fill=\"#5E8E3E\" sketch:type=\"MSShapeGroup\" cx=\"680\" cy=\"456\" r=\"5\"></circle>\n              <circle id=\"Oval-1\" fill=\"#5E8E3E\" sketch:type=\"MSShapeGroup\" cx=\"592\" cy=\"490\" r=\"5\"></circle>\n              <circle id=\"Oval-1\" fill=\"#5E8E3E\" sketch:type=\"MSShapeGroup\" cx=\"595.5\" cy=\"637.5\" r=\"5.5\"></circle>\n              <circle id=\"Oval-1\" fill=\"#5E8E3E\" sketch:type=\"MSShapeGroup\" cx=\"600.5\" cy=\"399.5\" r=\"12.5\"></circle>\n              <circle id=\"Oval-1\" fill=\"#5E8E3E\" sketch:type=\"MSShapeGroup\" cx=\"592.5\" cy=\"382.5\" r=\"4.5\"></circle>\n              <circle id=\"Oval-1\" fill=\"#5E8E3E\" sketch:type=\"MSShapeGroup\" cx=\"599\" cy=\"322\" r=\"7\"></circle>\n              <circle id=\"Oval-1\" fill=\"#5E8E3E\" sketch:type=\"MSShapeGroup\" cx=\"599\" cy=\"337\" r=\"7\"></circle>\n              <circle id=\"Oval-1\" fill=\"#5E8E3E\" sketch:type=\"MSShapeGroup\" cx=\"616\" cy=\"478\" r=\"12\"></circle>\n              <circle id=\"Oval-1\" fill=\"#5E8E3E\" sketch:type=\"MSShapeGroup\" cx=\"663\" cy=\"448\" r=\"12\"></circle>\n              <circle id=\"Oval-1\" fill=\"#5E8E3E\" sketch:type=\"MSShapeGroup\" cx=\"684\" cy=\"536\" r=\"12\"></circle>\n              <circle id=\"Oval-1\" fill=\"#5E8E3E\" sketch:type=\"MSShapeGroup\" cx=\"702\" cy=\"663\" r=\"12\"></circle>\n              <circle id=\"Oval-1\" fill=\"#5E8E3E\" sketch:type=\"MSShapeGroup\" cx=\"660\" cy=\"687\" r=\"12\"></circle>\n              <circle id=\"Oval-1\" fill=\"#5E8E3E\" sketch:type=\"MSShapeGroup\" cx=\"656\" cy=\"356\" r=\"12\"></circle>\n              <path d=\"M667,435 C673.627417,435 679,429.627417 679,423 C679,416.372583 673.627417,411 667,411 C660.372583,411 655,416.372583 655,423 C655,429.627417 660.372583,435 667,435 Z\" id=\"Oval-1\" fill=\"#5E8E3E\" sketch:type=\"MSShapeGroup\"></path>\n              <path d=\"M632,464 C640.836556,464 648,456.836556 648,448 C648,439.163444 640.836556,432 632,432 C623.163444,432 616,439.163444 616,448 C616,456.836556 623.163444,464 632,464 Z\" id=\"Oval-1\" fill=\"#5E8E3E\" sketch:type=\"MSShapeGroup\"></path>\n              <path d=\"M659.5,399 C666.955844,399 673,392.955844 673,385.5 C673,378.044156 666.955844,372 659.5,372 C652.044156,372 646,378.044156 646,385.5 C646,392.955844 652.044156,399 659.5,399 Z\" id=\"Oval-1\" fill=\"#5E8E3E\" sketch:type=\"MSShapeGroup\"></path>\n              <path d=\"M611.5,531 C622.269553,531 631,522.269553 631,511.5 C631,500.730447 622.269553,492 611.5,492 C600.730447,492 592,500.730447 592,511.5 C592,522.269553 600.730447,531 611.5,531 Z\" id=\"Oval-1\" fill=\"#5E8E3E\" sketch:type=\"MSShapeGroup\"></path>\n              <circle id=\"Oval-1\" fill=\"#95BE47\" sketch:type=\"MSShapeGroup\" cx=\"410\" cy=\"351\" r=\"7\"></circle>\n              <circle id=\"Oval-1\" fill=\"#95BE47\" sketch:type=\"MSShapeGroup\" cx=\"414\" cy=\"334\" r=\"7\"></circle>\n              <circle id=\"Oval-1\" fill=\"#95BE47\" sketch:type=\"MSShapeGroup\" cx=\"421\" cy=\"320\" r=\"7\"></circle>\n              <circle id=\"Oval-1\" fill=\"#95BE47\" sketch:type=\"MSShapeGroup\" cx=\"428\" cy=\"306\" r=\"7\"></circle>\n              <circle id=\"Oval-1\" fill=\"#95BE47\" sketch:type=\"MSShapeGroup\" cx=\"435\" cy=\"292\" r=\"7\"></circle>\n              <circle id=\"Oval-1\" fill=\"#95BE47\" sketch:type=\"MSShapeGroup\" cx=\"445\" cy=\"281\" r=\"7\"></circle>\n              <circle id=\"Oval-1\" fill=\"#95BE47\" sketch:type=\"MSShapeGroup\" cx=\"456\" cy=\"271\" r=\"7\"></circle>\n              <circle id=\"Oval-1\" fill=\"#95BE47\" sketch:type=\"MSShapeGroup\" cx=\"470\" cy=\"261\" r=\"7\"></circle>\n              <circle id=\"Oval-1\" fill=\"#95BE47\" sketch:type=\"MSShapeGroup\" cx=\"487\" cy=\"257\" r=\"7\"></circle>\n              <circle id=\"Oval-1\" fill=\"#95BE47\" sketch:type=\"MSShapeGroup\" cx=\"505\" cy=\"257\" r=\"7\"></circle>\n              <circle id=\"Oval-1\" fill=\"#95BE47\" sketch:type=\"MSShapeGroup\" cx=\"516\" cy=\"271\" r=\"7\"></circle>\n              <circle id=\"Oval-1\" fill=\"#95BE47\" sketch:type=\"MSShapeGroup\" cx=\"534\" cy=\"271\" r=\"7\"></circle>\n              <circle id=\"Oval-1\" fill=\"#95BE47\" sketch:type=\"MSShapeGroup\" cx=\"548\" cy=\"280\" r=\"7\"></circle>\n              <circle id=\"Oval-1\" fill=\"#95BE47\" sketch:type=\"MSShapeGroup\" cx=\"559\" cy=\"294\" r=\"7\"></circle>\n              <circle id=\"Oval-1\" fill=\"#95BE47\" sketch:type=\"MSShapeGroup\" cx=\"566\" cy=\"310\" r=\"7\"></circle>\n              <circle id=\"Oval-1\" fill=\"#95BE47\" sketch:type=\"MSShapeGroup\" cx=\"523\" cy=\"285\" r=\"7\"></circle>\n              <circle id=\"Oval-1\" fill=\"#95BE47\" sketch:type=\"MSShapeGroup\" cx=\"502\" cy=\"278\" r=\"7\"></circle>\n              <circle id=\"Oval-1\" fill=\"#95BE47\" sketch:type=\"MSShapeGroup\" cx=\"488\" cy=\"287\" r=\"7\"></circle>\n              <circle id=\"Oval-1\" fill=\"#95BE47\" sketch:type=\"MSShapeGroup\" cx=\"480\" cy=\"301\" r=\"7\"></circle>\n              <circle id=\"Oval-1\" fill=\"#95BE47\" sketch:type=\"MSShapeGroup\" cx=\"470\" cy=\"316\" r=\"7\"></circle>\n              <circle id=\"Oval-1\" fill=\"#95BE47\" sketch:type=\"MSShapeGroup\" cx=\"466\" cy=\"333\" r=\"7\"></circle>\n              <circle id=\"Oval-1\" fill=\"#95BE47\" sketch:type=\"MSShapeGroup\" cx=\"379\" cy=\"414\" r=\"37\"></circle>\n              <circle id=\"Oval-1\" fill=\"#95BE47\" sketch:type=\"MSShapeGroup\" cx=\"422\" cy=\"576\" r=\"19\"></circle>\n              <circle id=\"Oval-1\" fill=\"#95BE47\" sketch:type=\"MSShapeGroup\" cx=\"476\" cy=\"486\" r=\"22\"></circle>\n              <circle id=\"Oval-1\" fill=\"#95BE47\" sketch:type=\"MSShapeGroup\" cx=\"538.5\" cy=\"510.5\" r=\"40.5\"></circle>\n              <circle id=\"Oval-1\" fill=\"#95BE47\" sketch:type=\"MSShapeGroup\" cx=\"493\" cy=\"670\" r=\"27\"></circle>\n              <circle id=\"Oval-1\" fill=\"#95BE47\" sketch:type=\"MSShapeGroup\" cx=\"543\" cy=\"632\" r=\"27\"></circle>\n              <circle id=\"Oval-1\" fill=\"#95BE47\" sketch:type=\"MSShapeGroup\" cx=\"557\" cy=\"349\" r=\"27\"></circle>\n              <circle id=\"Oval-1\" fill=\"#95BE47\" sketch:type=\"MSShapeGroup\" cx=\"470\" cy=\"375\" r=\"27\"></circle>\n              <circle id=\"Oval-1\" fill=\"#95BE47\" sketch:type=\"MSShapeGroup\" cx=\"360\" cy=\"478\" r=\"27\"></circle>\n              <circle id=\"Oval-1\" fill=\"#95BE47\" sketch:type=\"MSShapeGroup\" cx=\"351\" cy=\"537\" r=\"27\"></circle>\n              <circle id=\"Oval-1\" fill=\"#95BE47\" sketch:type=\"MSShapeGroup\" cx=\"330.5\" cy=\"634.5\" r=\"20.5\"></circle>\n              <circle id=\"Oval-1\" fill=\"#95BE47\" sketch:type=\"MSShapeGroup\" cx=\"316\" cy=\"662\" r=\"8\"></circle>\n              <circle id=\"Oval-1\" fill=\"#95BE47\" sketch:type=\"MSShapeGroup\" cx=\"368\" cy=\"573\" r=\"8\"></circle>\n              <circle id=\"Oval-1\" fill=\"#95BE47\" sketch:type=\"MSShapeGroup\" cx=\"386\" cy=\"557\" r=\"8\"></circle>\n              <circle id=\"Oval-1\" fill=\"#95BE47\" sketch:type=\"MSShapeGroup\" cx=\"380\" cy=\"511\" r=\"8\"></circle>\n              <circle id=\"Oval-1\" fill=\"#95BE47\" sketch:type=\"MSShapeGroup\" cx=\"392\" cy=\"535\" r=\"8\"></circle>\n              <circle id=\"Oval-1\" fill=\"#95BE47\" sketch:type=\"MSShapeGroup\" cx=\"394\" cy=\"576\" r=\"8\"></circle>\n              <circle id=\"Oval-1\" fill=\"#95BE47\" sketch:type=\"MSShapeGroup\" cx=\"406\" cy=\"551\" r=\"8\"></circle>\n              <circle id=\"Oval-1\" fill=\"#95BE47\" sketch:type=\"MSShapeGroup\" cx=\"355\" cy=\"614\" r=\"8\"></circle>\n              <circle id=\"Oval-1\" fill=\"#95BE47\" sketch:type=\"MSShapeGroup\" cx=\"360.5\" cy=\"671.5\" r=\"5.5\"></circle>\n              <circle id=\"Oval-1\" fill=\"#95BE47\" sketch:type=\"MSShapeGroup\" cx=\"375.5\" cy=\"671.5\" r=\"5.5\"></circle>\n              <circle id=\"Oval-1\" fill=\"#95BE47\" sketch:type=\"MSShapeGroup\" cx=\"330.5\" cy=\"666.5\" r=\"5.5\"></circle>\n              <circle id=\"Oval-1\" fill=\"#95BE47\" sketch:type=\"MSShapeGroup\" cx=\"426.5\" cy=\"682.5\" r=\"5.5\"></circle>\n              <circle id=\"Oval-1\" fill=\"#95BE47\" sketch:type=\"MSShapeGroup\" cx=\"454.5\" cy=\"690.5\" r=\"5.5\"></circle>\n              <circle id=\"Oval-1\" fill=\"#95BE47\" sketch:type=\"MSShapeGroup\" cx=\"463.5\" cy=\"651.5\" r=\"5.5\"></circle>\n              <circle id=\"Oval-1\" fill=\"#95BE47\" sketch:type=\"MSShapeGroup\" cx=\"487.5\" cy=\"636.5\" r=\"5.5\"></circle>\n              <circle id=\"Oval-1\" fill=\"#95BE47\" sketch:type=\"MSShapeGroup\" cx=\"506.5\" cy=\"638.5\" r=\"5.5\"></circle>\n              <circle id=\"Oval-1\" fill=\"#95BE47\" sketch:type=\"MSShapeGroup\" cx=\"498.5\" cy=\"625.5\" r=\"5.5\"></circle>\n              <circle id=\"Oval-1\" fill=\"#95BE47\" sketch:type=\"MSShapeGroup\" cx=\"512.5\" cy=\"617.5\" r=\"5.5\"></circle>\n              <circle id=\"Oval-1\" fill=\"#95BE47\" sketch:type=\"MSShapeGroup\" cx=\"509.5\" cy=\"602.5\" r=\"5.5\"></circle>\n              <circle id=\"Oval-1\" fill=\"#95BE47\" sketch:type=\"MSShapeGroup\" cx=\"512.5\" cy=\"587.5\" r=\"5.5\"></circle>\n              <circle id=\"Oval-1\" fill=\"#95BE47\" sketch:type=\"MSShapeGroup\" cx=\"506.5\" cy=\"548.5\" r=\"5.5\"></circle>\n              <circle id=\"Oval-1\" fill=\"#95BE47\" sketch:type=\"MSShapeGroup\" cx=\"486.5\" cy=\"520.5\" r=\"5.5\"></circle>\n              <circle id=\"Oval-1\" fill=\"#95BE47\" sketch:type=\"MSShapeGroup\" cx=\"449.5\" cy=\"477.5\" r=\"5.5\"></circle>\n              <circle id=\"Oval-1\" fill=\"#95BE47\" sketch:type=\"MSShapeGroup\" cx=\"503.5\" cy=\"477.5\" r=\"5.5\"></circle>\n              <circle id=\"Oval-1\" fill=\"#95BE47\" sketch:type=\"MSShapeGroup\" cx=\"517.5\" cy=\"467.5\" r=\"5.5\"></circle>\n              <circle id=\"Oval-1\" fill=\"#95BE47\" sketch:type=\"MSShapeGroup\" cx=\"521.5\" cy=\"453.5\" r=\"5.5\"></circle>\n              <circle id=\"Oval-1\" fill=\"#95BE47\" sketch:type=\"MSShapeGroup\" cx=\"541.5\" cy=\"411.5\" r=\"5.5\"></circle>\n              <circle id=\"Oval-1\" fill=\"#95BE47\" sketch:type=\"MSShapeGroup\" cx=\"583.5\" cy=\"371.5\" r=\"5.5\"></circle>\n              <circle id=\"Oval-1\" fill=\"#95BE47\" sketch:type=\"MSShapeGroup\" cx=\"586.5\" cy=\"327.5\" r=\"5.5\"></circle>\n              <circle id=\"Oval-1\" fill=\"#95BE47\" sketch:type=\"MSShapeGroup\" cx=\"584.5\" cy=\"313.5\" r=\"5.5\"></circle>\n              <circle id=\"Oval-1\" fill=\"#95BE47\" sketch:type=\"MSShapeGroup\" cx=\"525.5\" cy=\"332.5\" r=\"5.5\"></circle>\n              <circle id=\"Oval-1\" fill=\"#95BE47\" sketch:type=\"MSShapeGroup\" cx=\"485.5\" cy=\"342.5\" r=\"5.5\"></circle>\n              <circle id=\"Oval-1\" fill=\"#95BE47\" sketch:type=\"MSShapeGroup\" cx=\"385\" cy=\"372\" r=\"4\"></circle>\n              <circle id=\"Oval-1\" fill=\"#95BE47\" sketch:type=\"MSShapeGroup\" cx=\"439\" cy=\"390\" r=\"4\"></circle>\n              <circle id=\"Oval-1\" fill=\"#95BE47\" sketch:type=\"MSShapeGroup\" cx=\"394\" cy=\"455\" r=\"4\"></circle>\n              <circle id=\"Oval-1\" fill=\"#95BE47\" sketch:type=\"MSShapeGroup\" cx=\"390\" cy=\"464\" r=\"4\"></circle>\n              <circle id=\"Oval-1\" fill=\"#95BE47\" sketch:type=\"MSShapeGroup\" cx=\"495.5\" cy=\"401.5\" r=\"5.5\"></circle>\n              <circle id=\"Oval-1\" fill=\"#95BE47\" sketch:type=\"MSShapeGroup\" cx=\"452.5\" cy=\"405.5\" r=\"5.5\"></circle>\n              <circle id=\"Oval-1\" fill=\"#95BE47\" sketch:type=\"MSShapeGroup\" cx=\"539.5\" cy=\"459.5\" r=\"5.5\"></circle>\n              <circle id=\"Oval-1\" fill=\"#95BE47\" sketch:type=\"MSShapeGroup\" cx=\"522.5\" cy=\"388.5\" r=\"20.5\"></circle>\n              <circle id=\"Oval-1\" fill=\"#95BE47\" sketch:type=\"MSShapeGroup\" cx=\"566.5\" cy=\"396.5\" r=\"20.5\"></circle>\n              <circle id=\"Oval-1\" fill=\"#95BE47\" sketch:type=\"MSShapeGroup\" cx=\"562.5\" cy=\"460.5\" r=\"13.5\"></circle>\n              <circle id=\"Oval-1\" fill=\"#95BE47\" sketch:type=\"MSShapeGroup\" cx=\"572.5\" cy=\"432.5\" r=\"13.5\"></circle>\n              <circle id=\"Oval-1\" fill=\"#95BE47\" sketch:type=\"MSShapeGroup\" cx=\"540.5\" cy=\"432.5\" r=\"13.5\"></circle>\n              <circle id=\"Oval-1\" fill=\"#95BE47\" sketch:type=\"MSShapeGroup\" cx=\"509\" cy=\"349\" r=\"15\"></circle>\n              <circle id=\"Oval-1\" fill=\"#95BE47\" sketch:type=\"MSShapeGroup\" cx=\"431\" cy=\"408\" r=\"12\"></circle>\n              <circle id=\"Oval-1\" fill=\"#95BE47\" sketch:type=\"MSShapeGroup\" cx=\"420\" cy=\"383\" r=\"12\"></circle>\n              <circle id=\"Oval-1\" fill=\"#95BE47\" sketch:type=\"MSShapeGroup\" cx=\"433\" cy=\"363\" r=\"9\"></circle>\n              <circle id=\"Oval-1\" fill=\"#95BE47\" sketch:type=\"MSShapeGroup\" cx=\"399.5\" cy=\"372.5\" r=\"7.5\"></circle>\n              <circle id=\"Oval-1\" fill=\"#95BE47\" sketch:type=\"MSShapeGroup\" cx=\"345\" cy=\"663\" r=\"8\"></circle>\n              <circle id=\"Oval-1\" fill=\"#95BE47\" sketch:type=\"MSShapeGroup\" cx=\"370\" cy=\"648\" r=\"17\"></circle>\n              <circle id=\"Oval-1\" fill=\"#95BE47\" sketch:type=\"MSShapeGroup\" cx=\"404\" cy=\"669\" r=\"17\"></circle>\n              <circle id=\"Oval-1\" fill=\"#95BE47\" sketch:type=\"MSShapeGroup\" cx=\"445\" cy=\"668\" r=\"17\"></circle>\n              <circle id=\"Oval-1\" fill=\"#95BE47\" sketch:type=\"MSShapeGroup\" cx=\"534\" cy=\"692\" r=\"17\"></circle>\n              <circle id=\"Oval-1\" fill=\"#95BE47\" sketch:type=\"MSShapeGroup\" cx=\"560.5\" cy=\"674.5\" r=\"12.5\"></circle>\n              <circle id=\"Oval-1\" fill=\"#95BE47\" sketch:type=\"MSShapeGroup\" cx=\"548.5\" cy=\"580.5\" r=\"12.5\"></circle>\n              <circle id=\"Oval-1\" fill=\"#95BE47\" sketch:type=\"MSShapeGroup\" cx=\"566\" cy=\"599\" r=\"9\"></circle>\n              <circle id=\"Oval-1\" fill=\"#95BE47\" sketch:type=\"MSShapeGroup\" cx=\"529\" cy=\"593\" r=\"9\"></circle>\n              <circle id=\"Oval-1\" fill=\"#95BE47\" sketch:type=\"MSShapeGroup\" cx=\"565.5\" cy=\"557.5\" r=\"12.5\"></circle>\n              <circle id=\"Oval-1\" fill=\"#95BE47\" sketch:type=\"MSShapeGroup\" cx=\"523\" cy=\"566\" r=\"16\"></circle>\n              <circle id=\"Oval-1\" fill=\"#95BE47\" sketch:type=\"MSShapeGroup\" cx=\"563.5\" cy=\"705.5\" r=\"9.5\"></circle>\n              <circle id=\"Oval-1\" fill=\"#95BE47\" sketch:type=\"MSShapeGroup\" cx=\"337.5\" cy=\"588.5\" r=\"20.5\"></circle>\n              <circle id=\"Oval-1\" fill=\"#95BE47\" sketch:type=\"MSShapeGroup\" cx=\"527\" cy=\"301\" r=\"7\"></circle>\n              <circle id=\"Oval-1\" fill=\"#95BE47\" sketch:type=\"MSShapeGroup\" cx=\"529\" cy=\"316\" r=\"7\"></circle>\n          </g>\n      </g>\n  </svg>";

var FUTURE_RETRO_SOURCE = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n  <!-- Generator: Adobe Illustrator 19.0.0, SVG Export Plug-In . SVG Version: 6.00 Build 0)  -->\n  <!DOCTYPE svg PUBLIC \"-//W3C//DTD SVG 1.1//EN\" \"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\">\n  <svg version=\"1.1\" id=\"Layer_1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\"\n     viewBox=\"0 0 792 612\" enable-background=\"new 0 0 792 612\" xml:space=\"preserve\">\n  <circle id=\"XMLID_3_\" fill=\"#F1E4BA\" cx=\"384.1\" cy=\"150.4\" r=\"76.7\"/>\n  <circle id=\"XMLID_6_\" fill=\"#F1E4BA\" cx=\"358.2\" cy=\"441.1\" r=\"55.4\"/>\n  <circle id=\"XMLID_7_\" fill=\"#F9A464\" cx=\"683.1\" cy=\"66.5\" r=\"14.5\"/>\n  <circle id=\"XMLID_8_\" fill=\"#F1584A\" cx=\"638.5\" cy=\"220.9\" r=\"78.2\"/>\n  <circle id=\"XMLID_11_\" fill=\"#F9A464\" cx=\"83.6\" cy=\"483\" r=\"24.9\"/>\n  <circle id=\"XMLID_14_\" fill=\"#00A29A\" cx=\"200.2\" cy=\"507.9\" r=\"50.8\"/>\n  <circle id=\"XMLID_16_\" fill=\"#F1584A\" cx=\"404.3\" cy=\"549.4\" r=\"25.9\"/>\n  <circle id=\"XMLID_17_\" fill=\"#F9A464\" cx=\"258.7\" cy=\"66.5\" r=\"14.5\"/>\n  <g id=\"XMLID_18_\">\n  </g>\n  <g id=\"XMLID_19_\">\n  </g>\n  <g id=\"XMLID_20_\">\n  </g>\n  <g id=\"XMLID_21_\">\n  </g>\n  <g id=\"XMLID_22_\">\n  </g>\n  <g id=\"XMLID_23_\">\n  </g>\n  </svg>";

var svgParser = new SVGParser(FUTURE_RETRO_SOURCE);
_log(svgParser);

var musicMachine = new MusicMachine(T);

var soundCollider = new SoundCollider(svgParser.svgData.viewboxWidth, svgParser.svgData.viewboxHeight, Matter, musicMachine);
_log(soundCollider);

soundCollider.setup();
soundCollider.addCirclesFromSVGNodes(svgParser.svgData.circleNodes);
soundCollider.run();
