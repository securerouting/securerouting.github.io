var svgAnimator = function(svgname) {
    var that = {};
    that.svgname = svgname || "svg";
    
    var doDebug = false;

    that.debug = function(stuff) {
	if (doDebug) {
	    console.log(stuff);
	}
    }
    that.setDebug = function(val) {
	doDebug = val;
    }

    var startingNodes = [
	// state: 0
	[
	    { 'type': 'circle', // we can handle circles
	      'states': 
	      [ // 2 circles, properties of each at state 0
		  {
		      cx: 100,
		      cy: 100,
		      r: 20,
		      style: "fill:red;"
		  },
		  {
		      cx: 30,
		      cy: 30,
		      r: 20,
		      style: "fill:green;"
		  },
	      ],
	    },
	    { 'type': 'line', // and lines
	      'states':
	      [ // just one line with it's values at state 0
		  {
		      x1: 100,
		      y1: 100,
		      x2: 200,
		      y2: 200,
		      stroke: 'black'
		  }
	      ]
	    },
	    { 'type': 'text',
	      'states':
	      [
		  {
		      text: "10.0.0.0/8",
		      x: 150,
		      y: 100,
		      fill: 'green',
		  }
	      ],
	    },
	],

	// state: 1
	[
	    { 'type':   'circle',
	      'states':  
	      [
		  {
		      cx: 100,
		      cy: 30,
		      r: 20,
		      style: "fill:blue;"
		  },
		  {
		      cx: 300,
		      cy: 300,
		      r: 20,
		      style: "fill:purple;"
		  },
	      ],
	    },
	    { 'type': 'line',
	      'states':
	      [
		  {
		      x1: 200,
		      y1: 100,
		      x2: 100,
		      y2: 200,
		      stroke: 'black'
		  }
	      ]
	    },
	    { 'type': 'text',
	      'states':
	      [
		  {
		      text: '10.0.0.0/8',
		      x: 150,
		      y: 100,
		      fill: 'red',
		  }
	      ],
	    },
	],

	// state: 2
	[
	    { 'type': 'circle',
	      'states': 
	      [
		  {
		      cx: 150,
		      cy: 100,
		      r: 100,
		      style: "fill:blue;"
		  },
		  {
		      cx: 30,
		      cy: 200,
		      r: 5,
		      style: "fill:purple;"
		  },
	      ]
	    },
	    { 'type': 'line',
	      'states':
	      [
		  {
		      x1: 100,
		      y1: 100,
		      x2: 100,
		      y2: 200,
		      stroke: 'black'
		  }
	      ]
	    },
	    { 'type': 'text',
	      'states':
	      [
		  {
		      text: '10.0.0.0/8',
		      x: 150,
		      y: 300,
		      fill: 'green',
		  }
	      ],
	    },
	],
    ];

    /*
     * Configuration parameters
     */
    var parameters = {
	duration: 2000
    }

    that.duration = function(n) {
	if (arguments.length == 0) {
	    return parameters.duration;
	}
	parameters.duration = n;
    }

    /*
     * Handling collections of objects/states
     */

    var collections = { };
    /*
     * A collection should be:
     * Name:
     * [ // Array of object types
     *   { // Object definition
     *      name:   SVGNAME (eg 'circle')
     *      states: [
     *                [ { x: 1, y: 1, r: 20, ... },       // circle 0, state 0
     *                  { x: 100, y: 100, r: 20, ... } ], // circle 1, state 0
     *                [ { x: 5, y: 5, r: 20, ... },       // circle 0, state 1
     *                  { x: 500, y: 500, r: 20, ... } ], // circle 1, state 1
     *              ],
     *   }, ... more object types (text, line, ...)
     * ]
     * 
     */

    that.addCollection = function(name, newc) {
	if (name in collections) {
	    console.log("Attempt to add a same-named collection ('" + name + "'); bailing");
	    return;
	}
	collections[name] = newc;
    }

    that.getCollection = function(name) {
	if (name in collections) {
	    return collections[name];
	}
	console.log("no such collection available: " + name);
    }

    that.setData = function(setname, slot, statenum, newdata) {
	var collection = this.getCollection(setname);
	//this.debug("collection length: " + collection.length);
	var objectList = collection[slot];

	// this.debug("list length: " + objectList.length);
	// this.debug(objectList);
	var object = objectList[statenum];

	// this.debug("setData");
	// this.debug(collection);
	// this.debug(object);
	// this.debug("  new data:");
	// this.debug(newdata);

	object.states = newdata;
    }

    /*
     * Object Handlers
     */

    var handlers = {
	parent: that,
	
	circle: function(nodes) {
	    // All the attributes we want to modify/animate:
            // for all the nodes, start a slow transition (2s)
	    nodes
		.transition().duration(this.parent.duration())
	    
		.attr("cx", function(d) { return d.cx; })
		.attr("cy", function(d) { return d.cy; })
		.attr("r", function(d) { return d.r; })
		.attr("style", function(d) { return d.style; })
		.attr("opacity", function(d) { return d.opacity; });
	},

	line: function(nodes) {
	    // All the attributes we want to modify/animate:
            // for all the nodes, start a slow transition (2s)
	    nodes
		.transition().duration(this.parent.duration())
	    
		.attr("x1", function(d) { return d.x1; })
		.attr("x2", function(d) { return d.x2; })
		.attr("y1", function(d) { return d.y1; })
		.attr("y2", function(d) { return d.y2; })
		.attr("stroke", function(d) { return d.stroke; })
		.attr("opacity", function(d) { return d.opacity; });
	},


	text: function(nodes) {
	    // All the attributes we want to modify/animate:
            // for all the nodes, start a slow transition (2s)
	    nodes
		.transition().duration(this.parent.duration())
	    
		.attr("x", function(d) { return d.x; })
		.attr("y", function(d) { return d.y; })
		.attr("fill", function(d) { return d.fill; })
		.attr("opacity", function(d) { return d.opacity; })
		.text(function(d) { return d.text; });
	}
    };

    that.addHandler = function(name, func) {
	if (name in handlers) {
	    console.log("Attempt to add a same-named handler ('" + name + "'); bailing");
	    return;
	}
	handlers[name] = func;
    }	
	

    that.switchView = function switchView(setname, stateNum) {
	this.debug("switching '" + setname + "' to state=" + stateNum);

	if (!(setname in collections)) {
	    console.log("failed to find the " + setname + " collection");
	    return;
	}

	var nodeStates = collections[setname];
	this.debug(nodeStates);

	if (stateNum >= nodeStates.length) {
	    // this.debug("not that many states available in " + setname);
	    // this.debug("  (requested: " + stateNum + " but only have " + nodeStates.length);
	    return;
	}
	
	this.debug("thingy: " + setname + " = " + stateNum);
	this.debug(nodeStates[stateNum]);

	for(var num=0; num < nodeStates[stateNum].length; num++) {
	    var group = nodeStates[stateNum][num];
	    var type = group.type;
	    var states = group.states;

	    var nodes=d3.select("svg").selectAll(type + "." + setname).data(states);
	    this.debug("states:");
	    this.debug(states);
	    this.debug("type: " + type + " / setname = " + setname);

	    // create new entries for anything missing
	    nodes.enter()
		.append(type)
		.classed(setname, true);

	    if (handlers[type]) {
		handlers[type](nodes);
	    }

	    if (group['callback'] &&
		group['callback']) {
		console.log("calling callback at " + num);
		group['callback']();
	    }
	}
    }

    that.addCollection('startingNodes', startingNodes);

    return that;
}

