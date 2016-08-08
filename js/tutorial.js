var rpkiTutorial = function() {
    var that = {};
    var svgname = "#svg2";

    var tut = new svgAnimator(svgname);


    var locations =
	{
	    'registry':
	    {
		bottomright: { x: 300, y: 90 + 20 },
		bottomleft:  { x: 170, y: 90 + 20 },
	    },

	    'parentcache':
	    {
		bottomright: { x: 550, y: 90 + 20 },
		bottomleft:  { x: 425, y: 90 + 20 },
	    },

	    'roacache':
	    {
		bottomleft: { x: 570, y: 55 },
	    },

	    'resources':
	    {
		bottomleft: { x: 70, y: 600-170 },
	    },

	    'yourISP':
	    {
		upperright: { x: 195, y: 300 },
	    },

	    'anotherISP':
	    {
		bottomleft: { x: 245, y: 600-60 },
		upperright: { x: 370, y: 600-150 },
	    },

	    'distantISP':
	    {
		left:       { x: 400, y: 600-275 },
		lowerleft2: { x: 445, y: 600-170 },
	    }
	}

    that.anim = function() {
	return tut;
    }

    that.createInfrastructure = function() {
	tut.addCollection('background',
			  [
			      [ // we only need one state for the background, which doesn't change
				  { type: 'circle',
				    states:
				    [{ cx: 200, cy: 100, r: 20, style: 'fill:green;'},
				     { cx: 500, cy: 100, r: 20, style: 'fill:yellow;'},]
				  },
				  { type: 'line',
				    states:
				    [{ x1: 200, y1: 100, x2: 500, y2: 100, stroke: 'black'}]
				  }
			      ],
			  ]);
	tut.switchView('background', 0);
    }

    //-----------------------------------------------------------------
    // Generic support functions
    var incrementors = {};

    that.createIncrementor = function(name, startValue, increment) {
	incrementors[name] = {
	    'name':       name,
	    'startValue': startValue,
	    'increment':  increment,
	    'value':      startValue,
	}
	return this;
    }
	    
    that.getIncrementorValue = function(name) {
	if (!incrementors[name]) {
	    createIncrementor(name, 0, 10);
	}
	var val = incrementors[name].value;
	incrementors[name].value = incrementors[name].value + incrementors[name].increment;
	return val;
    }

    //-----------------------------------------------------------------
    // resources certificates
    that.certificateX = locations.resources.bottomleft.x;
    that.certificateY = locations.resources.bottomleft.y;
    var certificateTableName = 'certificateTable';
    var certificateObjectList = [];
    var certificateList = [];

    that.createCertificateTable = function() {
	var routeHeader = d3.select(svgname).selectAll("#certificates");
	this.createIncrementor('certificateY', this.certificateY, 20);
	
	tut.addCollection(certificateTableName, certificateObjectList);
    }

    that.getCertificateSlot = function() {
	return this.getIncrementorValue('certificateY');
    }

    that.getCertificateRow = function(addressspace, options) {
	if (!options) {
	    options = {};
	}
	return [
	    { type: 'text',
	      states: [
		  { x: options.x || addressspace.x,
		    y: options.y || addressspace.y,
		    fill: addressspace.color || 'black',
		    text: addressspace.address,
		    active: addressspace.active || true,
		    opacity: addressspace.opacity || 1},
	      ]},
	];
    }


    that.createCertificateMenu = function() {
	var selectText = "<select class=\"c-select\" name=\"newROARoute\" id=\"newROARoute\">";
	for(var i = 0 ; i < certificateList.length ; i++) {
	    selectText = selectText + "<option value=\"" + certificateList[i].address + "\"";
	    if (i === 0) {
		selectText = selectText + " selected";
	    }
	    selectText = selectText + ">" + certificateList[i].name + "</option>";
	}

	selectText = selectText + "</select>";
	
	$('#certificatemenu').html(selectText);
    }

    that.certificateCount = 1;

    that.addCertificate = function(addressspace) {
	this.certificateCount = this.certificateCount + 1;

	tut.debug("new certificate: " + addressspace);

	var parts = this.splitNetBlock(addressspace);
	var address = parts[0];
	var length = parts[1];

	var obj = { 'name':   	addressspace,
		    'id':     	('Cert' + this.certificateCount),
		    'address':  address,
		    'length':   length,
		  };
	var certificateY = this.getCertificateSlot();

	obj.collection = [
	    this.getCertificateRow({ address: addressspace },
				   locations.registry.bottomleft ),
	    this.getCertificateRow({ address: addressspace },
				   { x: this.certificateX, y: certificateY }),
	];
	//obj.collection[3][0]['callback'] = function() { that.addROA(route, minLen, maxLen, AS, true); }
	console.log(obj.collection);

	obj.stateId = 0;
	certificateList.push(obj);

	tut.addCollection(obj.id, obj.collection);
	tut.switchView(obj.id, 0);

	this.createCertificateMenu();
    }

    //-----------------------------------------------------------------
    // Routing Table List
    that.routeX = 530;
    that.startY = 430;
    var routeTableName = 'routetable';

    var routeList = [];
    var routeListText = [{ type: 'text', states: [] }];
    var routeObjectList = [routeListText];
    var ASRouteOffset = 120;

    that.createRoutingTable = function() {

	var routeHeader = d3.select(svgname).selectAll("#routes");

	this.createIncrementor('routeY', this.startY, 20);

	tut.debug("header:");
	tut.debug(routeHeader[0][0]);
	// this.routeY = routeHeader.attr("y");  // fails, due to transformations
	// this.routeX = routeHeader.attr("x");

	tut.addCollection(routeTableName, routeObjectList);

	tut.switchView(routeTableName, 0);
    }

    that.getRouteRow = function(routeobj, options) {
	if (!options) {
	    options = {};
	}
	return [
	    { type: 'text',
	      states: [
		  { x: options.x || routeobj.x,
		    y: options.y || routeobj.y,
		    fill: routeobj.color,
		    text: routeobj.route,
		    active: routeobj.active || true,
		    opacity: routeobj.opacity || 1},
		  { x: (options.x || routeobj.x) + ASRouteOffset,
		    y: (options.y || routeobj.y),
		    fill: routeobj.color,
		    text: "AS" + routeobj.AS,
		    active: routeobj.active || true,
		    opacity: routeobj.opacity || 1 }
	      ]},
	];
    }

    that.getRouteSlot = function() {
	return this.getIncrementorValue('routeY');
    }

    that.addRoute = function(route) {
	var yPos = this.getRouteSlot();
	
	routeList.push(
	    { x: this.routeX, y: yPos, fill: 'black', text: route }
	);

	tut.debug("new route list : " + yPos);
	tut.debug(routeList);
	tut.setData(routeTableName, 0, 0, routeList);

	tut.debug('pushed:');
	tut.debug(routeList);

	tut.switchView(routeTableName, 0);
    }

    //-----------------------------------------------------------------
    // Animate a list of objects
    that.animateListNextStep = function(objectList) {
	tut.debug("animateListNextStep: ");
	tut.debug(objectList);
	for(var i = 0 ; i < objectList.length ; i++) {
	    if(objectList[i].stateId + 1 < objectList[i]['collection'].length) {
		tut.debug("animating: " + i + " = " + objectList[i].name);
		objectList[i].stateId = objectList[i].stateId + 1;
		tut.switchView(objectList[i].id, objectList[i].stateId);
	    }
	}
    }	


    //-----------------------------------------------------------------
    // ROA tables
    that.ROAX = 570;
    that.ROAY = 60;
    that.ROAStartX = 150;
    that.ROAStartY = 270;
    var ROATableName = 'ROAtable';
    var animatedROAList = [];

    var ROAList = [];
    var ROAListText = [{ type: 'text', states: [] }];
    var ROAObjectList = [ROAListText];
    var minOffset = 110;
    var ASOffset  = 150;

    that.createROATable = function() {

	this.createIncrementor('ROAY', this.ROAY, 20);

	var ROAHeader = d3.select(svgname).selectAll("#ROAs");
	tut.debug("header:");
	tut.debug(ROAHeader[0][0]);
	// this.ROAY = ROAHeader.attr("y");  // fails, due to transformations
	// this.ROAX = ROAHeader.attr("x");

	tut.debug("this.ROAY:");
	tut.debug(this.ROAY);
	tut.addCollection(ROATableName, ROAObjectList);

	tut.switchView(ROATableName, 0);
    }

    that.getROAY = function() {
	var val = this.getIncrementorValue('ROAY');
	return val;
    }

    that.addROA = function(route, minLen, maxLen, AS, active) {
	tut.debug("new ROA list : " + this.ROAY);
	var ROAY = this.getROAY();

	var text = route + "/" + minLen + "-" + maxLen + ": AS" + AS;
	
	var color = 'black'; // (active ? 'black' : 'white');
	var opacity = (active ? 1 : 0);

	ROAList.push(
	    { x: this.ROAX, y: ROAY, fill: color, text: text, active: active, opacity: opacity,
	      route: route, minLen: minLen, maxLen: maxLen, AS: AS}
	);
	tut.debug('pushed:');
	tut.debug(ROAList);

	this.updateROAs();
	
	return ROAList.length;
    }

    that.checkROAList = function(routeblock, length, AS, thelist) {
	var foundCoverage = false;
	// check the list of static ROAs that were never animated
	for(var i = 0; i < thelist.length; i++) {
	    console.log("checking " + routeblock + " against " + thelist[i].route);
	    if (thelist[i].route === routeblock) {

		console.log("length  eq " + thelist[i].length + " <= " + length + " <= " + thelist[i].maxLen);
		console.log("AS      eq " + thelist[i].AS + " = " + AS);
		console.log(thelist[i]);

		if (length >= thelist[i].length) {
		    // coverage is at least found
		    console.log("  note: was covered");
		    foundCoverage = true;    
		}

		if (thelist[i].maxLen >= length && thelist[i].AS === AS) {
		    return 'valid';
		}
	    }
	}
	if (foundCoverage) {
	    return 'invalid';
	}
	return 'unknown';
    }

    that.splitNetBlock = function(route) {
	var findLength = /(.*)\/(\d+)$/;
	var results = findLength.exec(route);
	if (results && results.length === 3) {
	    return [results[1], results[2]];
	} else {
	    return [route, -1];
	}
    }

    that.checkROA = function (route, AS) {
	var length;
	var foundCoverage = false;
	var results = this.splitNetBlock(route);
	route = results[0];
	length = parseInt(results[1]);

	//console.log(results);

	if (! (length > 0)) {
	    console.log("invalid route length passed to checkRoa: " + route + " - " + length + ", " + AS);
	    return 'error';
	}

	var roaListState = this.checkROAList(route, length, AS, ROAList);
	var animListState = this.checkROAList(route, length, AS, animatedROAList);
	console.log("result: " + route + " / " + length + " -> " +
		    roaListState + " and " + animListState);

	if (roaListState === 'valid' || animListState === 'valid') {
	    return 'valid'; // XXX: prefer valid over invalid?
	}
	if (roaListState === 'invalid' || animListState === 'invalid') {
	    return 'invalid';
	}
	return roaListState; // xxx: alwasy unknown right????
    }

    that.getRouteColor = function(route, AS) {
	var state = this.checkROA(route, AS);

	if (state === "invalid") {
	    return 'red';
	}
	if (state === 'valid') {
	    return 'green';
	}

	// xxx: should check for illegal states and return
	// some 4th color?
	return 'orange';
    }

    that.getROARow = function(roaobj, options) {
	if (!options) {
	    options = {};
	}
	return [
	    { type: 'text',
	      states: [
		  { x: options.x || roaobj.x,
		    y: options.y || roaobj.y,
		    fill: roaobj.color,
		    text: roaobj.route,
		    active: roaobj.active || true,
		    opacity: roaobj.opacity || 1},
		  { x: (options.x || roaobj.x) + minOffset,
		    y: (options.y || roaobj.y),
		    fill: roaobj.color,
		    text: roaobj.maxLen,
		    active: roaobj.active || true,
		    opacity: roaobj.opacity || 1 },
		  { x: (options.x || roaobj.x) + ASOffset,
		    y: (options.y || roaobj.y),
		    fill: roaobj.color,
		    text: "AS" + roaobj.AS,
		    active: roaobj.active || true,
		    opacity: roaobj.opacity || 1 }
	      ]},
	];
    }

    that.updateROAs = function() {
	tut.debug("new ROA list : " + this.ROAY);
	tut.debug(ROAList);

	var data = new Array;
	for(var i = 0 ; i < ROAList.length; i++) {
	    var it = this.getROARow(ROAList[i]);
	    it = it[0].states;
	    data = data.concat(it);
	}
	tut.setData(ROATableName, 0, 0, data);

	console.log(data);
	tut.switchView(ROATableName, 0);
    }

    that.ROACount = 0;
    that.addAnimatedROA = function(route, length, AS, maxLen) {
	var name = route + AS + this.ROACount;
	this.ROACount = this.ROACount + 1;

	var obj = { 'name':   name,
		    'id':     ('ROA' + this.ROACount),
		    'route':  route,
		    'length': parseInt(length),
		    'maxLen': maxLen,
		    'AS':     AS,
		  };
	var yPos = 40;
	var ROAY = this.getROAY();

	var routeText = route + ": " + AS;

	obj.collection = [
	    this.getROARow({ route: route, AS: AS, color: 'black', maxLen: maxLen },
			   locations.yourISP.upperright ),
	    this.getROARow({ route: route, AS: AS, color: 'black', maxLen: maxLen },
			   locations.registry.bottomright ),
	    this.getROARow({ route: route, AS: AS, color: 'black', maxLen: maxLen },
			   locations.parentcache.bottomleft ),
	    this.getROARow({ route: route, AS: AS, color: 'black', maxLen: maxLen },
			   { x: this.ROAX, y: ROAY, fill: 'black', opacity: 0 }),
	];
	//obj.collection[3][0]['callback'] = function() { that.addROA(route, minLen, maxLen, AS, true); }
	console.log(obj.collection);

	obj.stateId = 0;
	animatedROAList.push(obj);

	tut.addCollection(obj.id, obj.collection);
	tut.switchView(obj.id, 0);
    }

    that.makeROAVisible = function(num) {
	var roa = ROAList[num-1];
	if (!roa) { return; }

	roa.active = true;
	roa.fill = 'black';
	roa.opacity = 1;
	this.updateROAs();
    }

    //-----------------------------------------------------------------------
    // Animated route
    var animatedRouteList = [];
    var routeStartX = 70;
    var routeBGPLine = that.startY - 40;

    that.routeCount = 0;
    that.addAnimatedRoute = function(route, AS, options) {
	var name = route + this.routeCount;
	this.routeCount = this.routeCount + 1;

	if (! options) {
	    options = {};
	}
	
	var obj = { 'name': name,
		    'id': ('r' + this.routeCount),
		    'route': route,
		    'AS': AS,
		    'text': route + " -> AS" + AS,
		  };
	var yPos = this.getRouteSlot();

	if (AS === '64500') {
	    obj.collection =
		[
		    this.getRouteRow({ route: route, AS: AS, color: 'black' },
				     locations.yourISP.upperright),
		    this.getRouteRow({ route: route, AS: AS, color: 'black' },
				     { x: (routeStartX + (this.routeX - routeStartX)/4 + 20),
				       y: routeBGPLine, }),
		    this.getRouteRow({ route: route, AS: AS, color: 'black' },
				     { x: (routeStartX + 3*(this.routeX - routeStartX)/5),
				       y: routeBGPLine, }),
		    this.getRouteRow({ route: route, AS: AS, color: (this.getRouteColor(route, AS)) },
				     { x: this.routeX, y: yPos, }),
		];
	} else {
	    obj.collection =
		[
		    this.getRouteRow({ route: route, AS: AS, color: 'black' },
				     locations.anotherISP.upperright ),
		    this.getRouteRow({ route: route, AS: AS, color: 'black' },
				     locations.distantISP.lowerleft2 ),
		    this.getRouteRow({ route: route, AS: AS, color: (this.getRouteColor(route, AS)) },
				     { x: this.routeX, y: yPos, }),
		];
	}
	console.log(obj.collection);
		
	obj.stateId = 0;
	animatedRouteList.push(obj);

	tut.addCollection(obj.id, obj.collection);
	tut.switchView(obj.id, 0);
    }

    that.animateAllRoutes = function(viewNum) {
	tut.debug("obj: ");
	tut.debug(animatedRouteList);
	for(var i = 0 ; i < animatedRouteList.length ; i++) {
	    tut.debug("animating: " + i + " = " + animatedRouteList[i].name);
	    tut.switchView(animatedRouteList[i].id, viewNum);
	    animatedRouteList[i].stateId = viewNum;
	}
    }

    //--------------------------------------------------------------------------
    //***********************************************************

    var barNum = 0;
    that.start = function() {
	// tut.setDebug(true);
	tut.duration(500);
	//tut.switchView('startingNodes', 0);

	
	// this.createInfrastructure();
	this.createRoutingTable();
	//this.addRoute("10/8");

	this.createROATable();
	//this.addROA("0.0.0.0", 0, 24, 44, 64510, true);
	//this.addROA("10.0.0.0", 10, 24, 64510, true);

	this.createCertificateTable();

	//barNum = that.addROA("bar", 16, 16, 6262, false);
	//setTimeout(function() { that.addROA("foo", 16, 16, 6262, true); }, 1500);
	//setTimeout(function() { that.makeROAVisible(barNum); }, 2500);

	// this.addAnimatedROA('192.168.1.1', '64500', 16, 24);
	// this.addAnimatedRoute('192.168.1.1/16', '64500');
	var it = this;
	setInterval(function() { it.animateListNextStep(animatedROAList); }, 1000);
	setInterval(function() { it.animateListNextStep(animatedRouteList); }, 1000);
	setInterval(function() { it.animateListNextStep(certificateList); }, 1000);
    }

    that.addToROA = function(text) {
	$("#routes").text($("#routes").text() + "\n" + text);
    }

    return that;
}

