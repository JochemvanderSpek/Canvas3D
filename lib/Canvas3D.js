"use strict";

/*
vTODO: loading OBJ and transform it
vTODO: loading object and repeating it in tree

TODO: simpele examples maken in openjscad / tinkercad
vTODO: shading in canvas3D instelbaar maken
vTODO: create shapes in canvas3D using begin/end shape (as in processing)
vTODO: branching / recusrive functions (L-system?)
TODO: MIDI files inlezen
TODO: more efficient forcefield / marching cubes
vTODO: sound input
vTODO: function plane
vTODO: chladni plane (port from Joop)

TODO: lineto

TODO: meshlab beschrijven

*/

THREE.Mesh.prototype.setPosition = function( x, y, z ){
	this.matrix.elements[ 12 ] = x;
	this.matrix.elements[ 13 ] = y;
	this.matrix.elements[ 14 ] = z;
	this.matrixWorld.elements[ 12 ] = x;
	this.matrixWorld.elements[ 13 ] = y;
	this.matrixWorld.elements[ 14 ] = z;
}

THREE.Mesh.prototype.getPosition = function(){
	return( [ 	this.matrix.elements[ 12 ], 
				this.matrix.elements[ 13 ],
				this.matrix.elements[ 14 ] ] );
}

THREE.Mesh.prototype.translate = function( x, y, z ){
	var tm = new THREE.Matrix4();
	tm.makeTranslation( x, y, z );
	this.matrix.multiply( tm );
	this.matrixWorld.multiply( tm );
}

THREE.Mesh.prototype.rotate = function( x, y, z ){
	var tm = new THREE.Matrix4();
	tm.makeRotationFromEuler( new THREE.Euler( x, y, z ) );
	this.matrix.multiply( tm );
	this.matrixWorld.multiply( tm );
}

THREE.Mesh.prototype.scaling = function( x, y, z ){
	var tm = new THREE.Matrix4();
	tm.makeScale( x, y, z );
	this.matrix.multiply( tm );
	this.matrixWorld.multiply( tm );
}

var KABK = function(){};

KABK.Canvas3D = function(){
	this.createLayerInterface( $( 'body' ), 'ObjectRenderer' );
	this.createEventDispatcherInterface();
	this.createMouseInterface( this );

	this.m_renderer = new THREE.WebGLRenderer( { antialias: true } );
	this.m_renderer.setSize( $( window ).width(), $( window ).height() );

	this.getBaseLayer().append( $( this.m_renderer.domElement ) );
	
	this.m_volumes = [];
	this.m_matrixStack = [];
	var matrix = new THREE.Matrix4();
	matrix.identity();
	this.m_matrixStack.push( matrix );

	this.m_scene = new THREE.Scene();
	
	var ratio = $( window ).width() / $( window ).height();
	this.m_cameraTHREE = new THREE.PerspectiveCamera(
		35,
		ratio,
		.1,
		5000
	);

	this.m_cameraTHREE.position.set( 100, 100, 50 );
//	this.m_cameraTHREE.up.set( 0, 0, 1 );
	this.m_cameraTHREE.lookAt( new THREE.Vector3( 0, 0, 0 ) );

	var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.9 );
	directionalLight.position.set( 0.5, 1, 0.5 );
	this.m_scene.add( directionalLight );

	directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
	directionalLight.position.set( -0.5, -1, -0.5 );
	this.m_scene.add( directionalLight );

	this.m_ambientLight = new THREE.AmbientLight( 0x080808, 0.3 );
	this.m_scene.add( this.m_ambientLight );
	 
	this.m_scene.add( new THREE.AxisHelper( 100 ) );

	this.m_controls = new THREE.OrbitControls( this.m_cameraTHREE, this.m_renderer.domElement );
	this.m_controls.center.set( 0, 0, 0 );

	this.m_currentMaterialName = 'phong';

	this.m_materials = {};
	this.m_materials.flat = new THREE.MeshLambertMaterial( { shading: THREE.FlatShading, color: 0xffffff, side: THREE.DoubleSide } );
	this.m_materials.shaded = new THREE.MeshLambertMaterial( { color: 0xffffff, side: THREE.FrontSide } );
	this.m_materials.wireframe = new THREE.MeshBasicMaterial( { color: 0x00ee00, wireframe: true, transparent: true } ); 
	this.m_materials.normal = new THREE.MeshNormalMaterial( { shading: THREE.SmoothShading, side: THREE.DoubleSide, wireframe: true } );
	this.m_materials.phong = new THREE.MeshPhongMaterial( { shading: THREE.SmoothShading, side: THREE.DoubleSide } );

	var vertexShader = "varying vec3 myNormal;\
		varying vec3 myPosition;\
		void main() {\
			myNormal = normal.xyz;\
	 		gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\
			myPosition = gl_Position.xyz;\
		}";

	var fragmentShader = "uniform float time;\
		varying vec3 myNormal;\
		varying vec3 myPosition;\
		\
		void main() {\
			float d = abs( dot( -myNormal, normalize( myPosition - vec3( 1.0, 1.0, 1.0 ) ) ) );\
			gl_FragColor = vec4( vec3( d ), 1.0 );\
		}";

	var uniforms = {};

	this.m_materials.shader = new THREE.ShaderMaterial({
		uniforms: uniforms,
		vertexShader: vertexShader,
		fragmentShader: fragmentShader,
		side: THREE.DoubleSide
	} );

	this.m_autoRotate = true;
}

RT.addInterface( KABK.Canvas3D, RT.EventDispatcherInterface );
RT.addInterface( KABK.Canvas3D, RT.MouseInterface );
RT.addInterface( KABK.Canvas3D, RT.LayerInterface );

KABK.Canvas3D.prototype.setBackgroundColor = function( r, g, b ){
	this.m_renderer.setClearColor( new THREE.Color( r, g, b ), 1.0 );
}

KABK.Canvas3D.prototype.setAutoRotate = function( state, speed ){
	this.m_controls.autoRotate = state;
	if( speed !== undefined ){
		this.m_controls.autoRotateSpeed = speed;
	}
}

KABK.Canvas3D.prototype.setCameraPosition = function( x, y, z ){
	this.m_cameraTHREE.position.set( x, y, z );
}

KABK.Canvas3D.prototype.setCameraCenter = function( x, y, z ){
//	this.m_cameraTHREE.lookAt( new THREE.Vector3( x, y, z ) );
	this.m_controls.center.set( x, y, z );
}

KABK.Canvas3D.prototype.copy = function( object ){
	var mesh = object.clone();
	mesh.material = this.m_materials[ this.m_currentMaterialName ].clone();
	mesh.matrixAutoUpdate = false;
	mesh.matrix = this.m_matrixStack[ this.m_matrixStack.length - 1 ].clone();
	mesh.matrixWorld = this.m_matrixStack[ this.m_matrixStack.length - 1 ].clone();
	this.m_scene.add( mesh );
}

KABK.Canvas3D.prototype.remove = function( object ){
	this.m_scene.remove( object );
}

KABK.Canvas3D.prototype.beginShape = function(){
	this.m_newGeometry = new THREE.Geometry();
}

KABK.Canvas3D.prototype.vertex = function( x, y, z ){
	this.m_newGeometry.vertices.push( new THREE.Vector3( x, y, z ) );
}

KABK.Canvas3D.prototype.face = function( a, b, c ){
	this.m_newGeometry.faces.push( new THREE.Face3( a, b, c ) );
}

KABK.Canvas3D.prototype.triangle = function( x1, y1, z1, x2, y2, z2, x3, y3, z3  ){
	this.vertex( x1, y1, z1 );
	this.vertex( x2, y2, z2 );
	this.vertex( x3, y3, z3 );
	var n = this.m_newGeometry.vertices[ this.m_newGeometry.vertices.length - 3 ];
	this.face( n, n + 1 , n + 2 );
}

KABK.Canvas3D.prototype.beginShape = function(){
	this.m_newGeometry = new THREE.Geometry();
}

KABK.Canvas3D.prototype.endShape = function(){
	this.m_newGeometry.computeFaceNormals();
	this.m_newGeometry.computeVertexNormals();

	var mesh = new THREE.Mesh( this.m_newGeometry, this.m_materials[ this.m_currentMaterialName ].clone() );
	mesh.matrixAutoUpdate = false;
	mesh.matrix = this.m_matrixStack[ this.m_matrixStack.length - 1 ].clone();
	mesh.matrixWorld = this.m_matrixStack[ this.m_matrixStack.length - 1 ].clone();
	this.m_scene.add( mesh );
	return( mesh );
}

KABK.Canvas3D.prototype.tree = function( depth, numBranches, callback ){
	if( --depth === 0 ){
		return;
	}
	for( var i = 0; i < numBranches; i++ ){
		this.save();
		var nextBranches = callback( numBranches, i, depth );
		this.tree( depth, nextBranches, callback );
		this.restore();
	}
}

var SPEED_CONSTANT = 1.0;
// The polynomial scale of the frequency slide.
var FREQUENCY_SCALE = 3;
// The polynomial scale of the damping slide.
var DAMPING_SCALE = 6;

// Damping consistently puts friction on all waving points.
var damping_ = 1.0;
// Frequency on the sine wave equation, in 1/ticks
var frequency_ = 1 / 50;
var phase_ = 0.0;
var image_ = null;
var pos_matrix_ = null;
var vel_matrix_ = null;
var temp_matrix_ = null;
var canvas_;
var context_;
var width_;
var height_;
var heightField_;
var heightFieldHeight_;

KABK.Canvas3D.prototype.createChladniHeightField = function( width, height, depth, baseHeight, frequency, damping ){

	if( frequency !== undefined ){
		frequency_ = frequency;
	}
	if( damping !== undefined ){
		damping_ = damping;
	}

	phase_ = 0.0;
	image_ = null;
	pos_matrix_ = null;
	vel_matrix_ = null;
	temp_matrix_ = null;

	canvas_ = $( "<canvas width=" + width + " height=" + depth + "></canvas>" );
	// and get a context to the canvas
	context_ = canvas_[ 0 ].getContext( '2d' );
	width_ = width;
	height_ = depth;
	heightFieldHeight_ = height;

	// Index by row first, then column.
	function createTwoDimArray(width, height) {
    	var arr = [];
    	for (var r = 0; r < height; r++) {
    		var row = [];
    		for (var c = 0; c < width; c++) {
      			row.push(0);
			}
	      	arr.push(row);
    	}
		return arr;
	}

	// reset the canvas
	image_ = context_.createImageData(width_, height_);
	pos_matrix_ = createTwoDimArray(width_, height_);
	vel_matrix_ = createTwoDimArray(width_, height_);
	temp_matrix_ = createTwoDimArray(width_, height_);
	phase_ = 0;

	heightField_ = this.heightField( width, height, depth, canvas_, baseHeight );
//	canvas_.remove();
}

var min = Number.POSITIVE_INFINITY;
var max = Number.NEGATIVE_INFINITY;

KABK.Canvas3D.prototype.updateChladniHeightField = function( frequency ){
	// Update the input equation.
	var val = Math.sin(phase_);
	for (var i = 0; i < width_; i++) {
		pos_matrix_[0][i] = val;
		pos_matrix_[height_ - 1][i] = val;
	}
	for (var i = 0; i < height_; i++) {
		pos_matrix_[i][0] = val;
		pos_matrix_[i][width_ - 1] = val;
	}

    phase_ += 2 * Math.PI * frequency_;
    phase_ %= 2 * Math.PI;

	// Wave equation! Give an acceleration based on neighboring points.
	for (var r = 1; r < height_ - 1; r++) {
		for (var c = 1; c < width_ - 1; c++) {
			var neighbor_sum = pos_matrix_[r - 1][c] + pos_matrix_[r + 1][c] +
			               pos_matrix_[r][c - 1] + pos_matrix_[r][c + 1];
			var difference = pos_matrix_[r][c] - neighbor_sum / 4.0;
			temp_matrix_[r][c] = vel_matrix_[r][c] - SPEED_CONSTANT * difference;
		}
	}

	// Swap the velocity matrices.
	var temp = vel_matrix_;
	vel_matrix_ = temp_matrix_;
	temp_matrix_ = vel_matrix_;

	for (var r = 1; r < height_ - 1; r++) {
		for (var c = 1; c < width_ - 1; c++) {
			if( pos_matrix_[r][c] > max ){
				max = pos_matrix_[r][c];
			}
			if( pos_matrix_[r][c] < min ){
				min = pos_matrix_[r][c];
			}
		}
	}


	for (var r = 1; r < height_ - 1; r++) {
		for (var c = 1; c < width_ - 1; c++) {
			// Damp the velocity for each point.
			vel_matrix_[r][c] *= damping_;

			// Update the position for each point.
			pos_matrix_[r][c] += vel_matrix_[r][c];

			// Update the image_ so it's ready to draw if we need.
			var brightness = 0;
			brightness = Math.floor( 255 * ( ( pos_matrix_[r][c] - min ) / ( max - min ) ) );
			var index = 4 * (r * width_ + c);
			image_.data[index] = brightness;
			image_.data[index + 1] = brightness;
			image_.data[index + 2] = brightness;
			image_.data[index + 3] = 255;
		}
	}

	context_.putImageData(image_, 0, 0);

	var i = 0;
	for( var y = 0; y < height_; y++ ){
		for( var x = 0; x < width_; x++ ){
			var r = image_.data[ y * width_ * 4 + x * 4 + 0 ] / 255.0;
			var g = image_.data[ y * width_ * 4 + x * 4 + 1 ] / 255.0;
			var b = image_.data[ y * width_ * 4 + x * 4 + 2 ] / 255.0;
			var l = 0.299 * r + 0.587 * g + 0.114 * b;

			heightField_.geometry.vertices[ i++ ].set( x, l * heightFieldHeight_, y );
		}
	}
	heightField_.geometry.verticesNeedUpdate = true;
	heightField_.geometry.normalsNeedUpdate = true;
	heightField_.geometry.computeFaceNormals();
	heightField_.geometry.computeVertexNormals();
}

KABK.Canvas3D.prototype.loadObject = function( url, callback ){
	var mesh = new THREE.Mesh();
	mesh.matrixAutoUpdate = false;
	mesh.matrix = this.m_matrixStack[ this.m_matrixStack.length - 1 ].clone();
	mesh.matrixWorld = this.m_matrixStack[ this.m_matrixStack.length - 1 ].clone();
	this.m_scene.add( mesh );
	var loader = new THREE.OBJLoader();
	loader.load( url, $.proxy( this.onLoadOBJ, this, mesh, callback ) );
	return( mesh );
}

KABK.Canvas3D.prototype.onLoadOBJ = function( mesh, callback, object ){
	mesh.geometry = object.children[ 0 ].geometry.clone();
	mesh.material = this.m_materials[ this.m_currentMaterialName ].clone();
	mesh.geometry.verticesNeedUpdate = true;
	this.m_scene.add( mesh );
	if( callback ){
		callback( mesh );
	}
}

KABK.Canvas3D.prototype.material = function( name ){
	this.m_currentMaterialName = name;
}

KABK.Canvas3D.prototype.colorRGB = function( r, g, b ){
	this.m_materials[ this.m_currentMaterialName ].color.setRGB( r, g, b );
}

KABK.Canvas3D.prototype.colorHSL = function( h, s, l ){
	this.m_materials[ this.m_currentMaterialName ].color.setHSL( h, s, l );
}

KABK.Canvas3D.prototype.initialize = function(){
	this.initializeEventDispatcherInterface();
	this.initializeLayerInterface();
	this.initializeMouseInterface();

    this.m_initialized = true;
	this.dispatchEvent( new RT.Event( 'initialize', this, undefined ) );
}

KABK.Canvas3D.prototype.save = function() {
	this.m_matrixStack.push( this.m_matrixStack[ this.m_matrixStack.length - 1 ].clone() );
}

KABK.Canvas3D.prototype.translate = function( x, y, z ) {
	var matrix = new THREE.Matrix4();
	matrix.makeTranslation( x, y, z );
	this.m_matrixStack[ this.m_matrixStack.length - 1 ].multiply( matrix );
}

KABK.Canvas3D.prototype.rotate = function( x, y, z ) {
	var matrix = new THREE.Matrix4();
	matrix.makeRotationX( x );
	this.m_matrixStack[ this.m_matrixStack.length - 1 ].multiply( matrix );
	matrix.makeRotationY( y );
	this.m_matrixStack[ this.m_matrixStack.length - 1 ].multiply( matrix );
	matrix.makeRotationZ( z );
	this.m_matrixStack[ this.m_matrixStack.length - 1 ].multiply( matrix );
}

KABK.Canvas3D.prototype.scale = function( x, y, z ) {
	var matrix = new THREE.Matrix4();
	matrix.makeScale( x, y, z );
	this.m_matrixStack[ this.m_matrixStack.length - 1 ].multiply( matrix );
}

KABK.Canvas3D.prototype.save = function() {
	this.m_matrixStack.push( this.m_matrixStack[ this.m_matrixStack.length - 1 ].clone() );
}

KABK.Canvas3D.prototype.restore = function() {
	this.m_matrixStack.pop();
	if( this.m_matrixStack.length === 0 ){
		var matrix = new THREE.Matrix4();
		matrix.identity();
		this.m_matrixStack.push( matrix );
	}
}

KABK.Canvas3D.prototype.box = function( width, height, depth, widthSegments, heightSegments, depthSegments ) {
	var mesh = new THREE.Mesh( new THREE.BoxGeometry( width, height, depth, widthSegments, heightSegments, depthSegments ), this.m_materials[ this.m_currentMaterialName ].clone() );
	mesh.matrixAutoUpdate = false;
	mesh.matrix = this.m_matrixStack[ this.m_matrixStack.length - 1 ].clone();
	mesh.matrixWorld = this.m_matrixStack[ this.m_matrixStack.length - 1 ].clone();
	this.m_scene.add( mesh );
	return( mesh );
}

KABK.Canvas3D.prototype.cylinder = function( radiusTop, radiusBottom, height, radiusSegments, heightSegments ) {
	var mesh = new THREE.Mesh( new THREE.CylinderGeometry( radiusTop, radiusBottom, height, radiusSegments, heightSegments, false ), this.m_materials[ this.m_currentMaterialName ].clone() );
	mesh.matrixAutoUpdate = false;
	mesh.matrix = this.m_matrixStack[ this.m_matrixStack.length - 1 ].clone();
	mesh.matrixWorld = this.m_matrixStack[ this.m_matrixStack.length - 1 ].clone();
	this.m_scene.add( mesh );
	return( mesh );
}

KABK.Canvas3D.prototype.dodecahedron = function( radius, detail ) {
	var mesh = new THREE.Mesh( new THREE.DodecahedronGeometry( radius, detail ), this.m_materials[ this.m_currentMaterialName ].clone() );
	mesh.matrixAutoUpdate = false;
	mesh.matrix = this.m_matrixStack[ this.m_matrixStack.length - 1 ].clone();
	mesh.matrixWorld = this.m_matrixStack[ this.m_matrixStack.length - 1 ].clone();
	this.m_scene.add( mesh );
	return( mesh );
}

KABK.Canvas3D.prototype.icosahedron = function( radius, detail ) {
	var mesh = new THREE.Mesh( new THREE.IcosahedronGeometry( radius, detail ), this.m_materials[ this.m_currentMaterialName ].clone() );
	mesh.matrixAutoUpdate = false;
	mesh.matrix = this.m_matrixStack[ this.m_matrixStack.length - 1 ].clone();
	mesh.matrixWorld = this.m_matrixStack[ this.m_matrixStack.length - 1 ].clone();
	this.m_scene.add( mesh );
	return( mesh );
}

KABK.Canvas3D.prototype.octahedron = function( radius, detail ) {
	var mesh = new THREE.Mesh( new THREE.OctahedronGeometry( radius, detail ), this.m_materials[ this.m_currentMaterialName ].clone() );
	mesh.matrixAutoUpdate = false;
	mesh.matrix = this.m_matrixStack[ this.m_matrixStack.length - 1 ].clone();
	mesh.matrixWorld = this.m_matrixStack[ this.m_matrixStack.length - 1 ].clone();
	this.m_scene.add( mesh );
	return( mesh );
}

KABK.Canvas3D.prototype.sphere = function( radius, widthSegments, heightSegments ) {
	var geom = new THREE.SphereGeometry( radius, widthSegments, heightSegments );
	var sphere = new THREE.Mesh( geom, this.m_materials[ this.m_currentMaterialName ].clone() );
	sphere.matrixAutoUpdate = false;
	sphere.matrix = this.m_matrixStack[ this.m_matrixStack.length - 1 ].clone();
	sphere.matrixWorld = this.m_matrixStack[ this.m_matrixStack.length - 1 ].clone();
	this.m_scene.add( sphere );
	return( sphere );
}

KABK.Canvas3D.prototype.terahedron = function( radius, detail ) {
	var mesh = new THREE.Mesh( new THREE.TetrahedronGeometry( radius, detail ), this.m_materials[ this.m_currentMaterialName ].clone() );
	mesh.matrixAutoUpdate = false;
	mesh.matrix = this.m_matrixStack[ this.m_matrixStack.length - 1 ].clone();
	mesh.matrixWorld = this.m_matrixStack[ this.m_matrixStack.length - 1 ].clone();
	this.m_scene.add( mesh );
	return( mesh );
}

KABK.Canvas3D.prototype.text = function( text, parameters ) {
	var mesh = new THREE.Mesh( new THREE.TextGeometry( text, parameters ), this.m_materials[ this.m_currentMaterialName ].clone() );
	mesh.matrixAutoUpdate = false;
	mesh.matrix = this.m_matrixStack[ this.m_matrixStack.length - 1 ].clone();
	mesh.matrixWorld = this.m_matrixStack[ this.m_matrixStack.length - 1 ].clone();
	this.m_scene.add( mesh );
	return( mesh );
}

KABK.Canvas3D.prototype.torus = function( radius, tube, radialSegments, tubularSegments ) {
	var mesh = new THREE.Mesh( new THREE.TorusGeometry( radius, tube, radialSegments, tubularSegments, Math.TAU ), this.m_materials[ this.m_currentMaterialName ].clone() );
	mesh.matrixAutoUpdate = false;
	mesh.matrix = this.m_matrixStack[ this.m_matrixStack.length - 1 ].clone();
	mesh.matrixWorld = this.m_matrixStack[ this.m_matrixStack.length - 1 ].clone();
	this.m_scene.add( mesh );
	return( mesh );
}

KABK.Canvas3D.prototype.knot = function( radius, tube, radialSegments, tubularSegments, p, q, heightScale ) {
	var mesh = new THREE.Mesh( new THREE.TorusKnotGeometry( radius, tube, radialSegments, tubularSegments, p, q, heightScale ), this.m_materials[ this.m_currentMaterialName ].clone() );
	mesh.matrixAutoUpdate = false;
	mesh.matrix = this.m_matrixStack[ this.m_matrixStack.length - 1 ].clone();
	mesh.matrixWorld = this.m_matrixStack[ this.m_matrixStack.length - 1 ].clone();
	this.m_scene.add( mesh );
	return( mesh );
}

KABK.Blob = function( param ){
	this.m_matrix = ( param.matrix !== undefined ) ? param.matrix.clone() : ( new THREE.Matrix4() );
	this.m_size = ( param.size !== undefined ) ? param.size.clone() : ( new THREE.Vector3() );
	this.m_exponents = ( param.exponents !== undefined ) ? param.exponents.clone() : ( new THREE.Vector3( 1.0, 1.0, 1.0 ) );
	this.m_blend = ( param.blend !== undefined ) ? param.blend : 1.0;
}

KABK.Blob.prototype.evaluate = function( q ) {
	var m = this.m_matrix.clone();
	m.scale( this.m_size );
	var p = q.clone();
	p.applyMatrix4( m.getInverse( m.clone() ) );
/*
	var x = Math.pow( Math.abs( p.x ), 2.0 / this.m_exponents.x ) + Math.pow( Math.abs( p.z ), 2.0 / this.m_exponents.x );
	var y = Math.pow( Math.abs( p.y ), 2.0 / this.m_exponents.y );
	x = Math.pow( x, this.m_exponents.x / this.m_exponents.y ) + y;
	var c = x - 1.0;
*/
	var OneMinusD2 = 1.0 - p.lengthSq();
	return( Math.exp( -( OneMinusD2 * OneMinusD2 ) ) );
}

KABK.Canvas3D.prototype.blob = function( radius ) {
	var soid = new KABK.Blob( { 'matrix':( this.m_matrixStack[ this.m_matrixStack.length - 1 ].clone() ), 'size':new THREE.Vector3( radius, radius, radius ), 'exponents':new THREE.Vector3( 1.0, 1.0, 1.0 ), 'blend':0.0 } );
	this.m_volumes.push( soid );
}

KABK.Canvas3D.prototype.ellipsoid = function( width, height, depth, exponent1, exponent2, scalingStart, scalingMid, scalingEnd ) {
	var subPhi = 24;
	var subTheta = 24;

	if( scalingStart === undefined ){
		scalingStart = 1.0;
	}
	if( scalingMid === undefined ){
		scalingMid = 1.0;
	}
	if( scalingEnd === undefined ){
		scalingEnd = 1.0;
	}

	var geom = new THREE.Geometry(); 

	for( var i = 0; i < subPhi; i++ ){
		var phi = ( ( i + 1 ) / ( subPhi + 1 ) ) * Math.PI - 0.5 * Math.PI;

		if( i === 0 ){
			var v = new THREE.Vector3( 0, -height, 0 );
			geom.vertices.push( v ); 
		}

		for( var j = 0; j < subTheta; j++ ){
			var theta = ( j / subTheta ) * 2 * Math.PI;

			var cosPhi = Math.cos( phi );
			var cosTheta = Math.cos( theta );
			var sinPhi = Math.sin( phi );
			var sinTheta = Math.sin( theta );

			var t = Math.sign( cosPhi ) * Math.pow( Math.abs( cosPhi ), exponent1 );
			var x = t * Math.sign( cosTheta ) * Math.pow( Math.abs( cosTheta ), exponent2 );
			var y = Math.sign( sinPhi ) * Math.pow( Math.abs( sinPhi ), exponent1 );
			var z = t * Math.sign( sinTheta ) * Math.pow( Math.abs( sinTheta ), exponent2 );

			var scaling = 1.0;
			if( y < 0.0 ){
				var lerp = Math.abs( y );
				scaling = lerp * scalingStart + ( 1.0 - lerp ) * scalingMid;
			}
			else{
				var lerp = y;
				scaling = ( 1.0 - lerp ) * scalingMid + lerp * scalingEnd;
			}

			var v = new THREE.Vector3( x * width * scaling, y * height, z * depth * scaling );

			geom.vertices.push( v );
		}

		if( i === subPhi - 1 ){
			var v = new THREE.Vector3( 0, height, 0 );
			geom.vertices.push( v ); 
		}
	}

	for( var j = 0; j < subTheta; j++ ){
		var i0 = 0;
		var i1 = 1 + j % subTheta;
		var i2 = 1 + ( j + 1 ) % subTheta;
		geom.faces.push( new THREE.Face3( i0, i1, i2 ) );

		var n = geom.vertices.length - 1;
		var i0 = n;
		var i1 = n - subTheta + j;
		var i2 = n - subTheta + ( j + 1 ) % subTheta;
		geom.faces.push( new THREE.Face3( i2, i1, i0 ) );
	}
	for( var i = 1; i < subPhi; i++ ){
		for( var j = 0; j < subTheta; j++ ){
			var i0 = 1 + ( i - 1 ) * subTheta + j;
			var i1 = 1 + ( i - 1 ) * subTheta + ( ( j + 1 ) % subTheta );
			var i2 = 1 + i * subTheta + j;
			var i3 = 1 + i * subTheta + ( ( j + 1 ) % subTheta );

			geom.faces.push( new THREE.Face3( i0, i2, i3 ) );
			geom.faces.push( new THREE.Face3( i0, i3, i1 ) );
		}
	}

	geom.computeFaceNormals();
	geom.computeVertexNormals();

	var soid = new THREE.Mesh( geom, this.m_materials[ this.m_currentMaterialName ].clone() );
	soid.matrixAutoUpdate = false;
	soid.matrix = this.m_matrixStack[ this.m_matrixStack.length - 1 ].clone();
	soid.matrixWorld = this.m_matrixStack[ this.m_matrixStack.length - 1 ].clone();
	this.m_scene.add( soid );
	return( soid );
}

KABK.Canvas3D.prototype.tube = function( points, segments, radius, radiusSegments, closed ) {

	var v = [];
	for( var i = 0; i < points.length; i++ ){
		var p = points[ i ];
		if( p.length !== undefined ){
			v.push( new THREE.Vector3( p[ 0 ], p[ 1 ], p[ 2 ] ) );			
		}
		else{
			v.push( new THREE.Vector3( p.x, p.y, p.z ) );
		}
	}

	var path = new THREE.SplineCurve3( v );

	var geom = new THREE.TubeGeometry(
	    path,  //path
	    segments,    //segments
	    radius,     //radius
	    radiusSegments,     //radiusSegments
	    closed  //closed
	);
	geom.computeFaceNormals();
	geom.computeVertexNormals();

	var mesh = new THREE.Mesh( geom, this.m_materials[ this.m_currentMaterialName ].clone() );
	mesh.matrixAutoUpdate = false;
	mesh.matrix = this.m_matrixStack[ this.m_matrixStack.length - 1 ].clone();
	mesh.matrixWorld = this.m_matrixStack[ this.m_matrixStack.length - 1 ].clone();
	this.m_scene.add( mesh );
	return( mesh );
}

KABK.Canvas3D.prototype.heightField = function( width, height, depth, image, baseHeight ) {
	var geom = new THREE.Geometry(); 

	var baseHeight = baseHeight || 5;
	var canvasW = width;
	var canvasH = depth;

	if( $.type( image ) === "function" ){
		for( var y = 0; y < canvasW; y++ ){
			var fy = y / ( canvasW - 1 );
			for( var x = 0; x < canvasW; x++ ){
				var fx = x / ( canvasW - 1 );
				var value = image( fx, fy );
				var v = new THREE.Vector3( x, value * height, y );

				geom.vertices.push( v );
			}
		}
	}
	else{
		var canvas = $( '<canvas width="' + canvasW + '" height="' + canvasH + '"></canvas>' );
		var context = canvas[ 0 ].getContext( '2d' );
		context.drawImage( image[ 0 ], 0, 0, canvasW, canvasH );

		var pixels = context.getImageData( 0, 0, canvasW, canvasH ).data;

		for( var y = 0; y < canvasH; y++ ){
			for( var x = 0; x < canvasW; x++ ){
				var r = pixels[ y * canvasW * 4 + x * 4 + 0 ] / 255.0;
				var g = pixels[ y * canvasW * 4 + x * 4 + 1 ] / 255.0;
				var b = pixels[ y * canvasW * 4 + x * 4 + 2 ] / 255.0;
				var l = 0.299 * r + 0.587 * g + 0.114 * b;

				var v = new THREE.Vector3( x, l * height, y );

				geom.vertices.push( v );
			}
		}
		canvas.remove();
	}

	for( var y = 0; y < canvasH - 1; y++ ){
		for( var x = 0; x < canvasW - 1; x++ ){
			var i0 = y * canvasW + x;
			var i1 = y * canvasW + x + 1;
			var i2 = ( y + 1 ) * canvasW + x;
			var i3 = ( y + 1 ) * canvasW + x + 1;

			geom.faces.push( new THREE.Face3( i2, i1, i0 ) );
			geom.faces.push( new THREE.Face3( i3, i1, i2 ) );
		}
	}
	var XMinOff = geom.vertices.length;
	for( var x = 0; x < canvasW; x++ ){
		geom.vertices.push( new THREE.Vector3( x, -baseHeight, 0 ) );
	}
	var XMaxOff = geom.vertices.length;
	for( var x = 0; x < canvasW; x++ ){
		geom.vertices.push( new THREE.Vector3( x, -baseHeight, canvasH - 1 ) );
	}
	var YMinOff = geom.vertices.length;
	for( var y = 0; y < canvasH; y++ ){
		geom.vertices.push( new THREE.Vector3( 0, -baseHeight, y ) );
	}
	var YMaxOff = geom.vertices.length;
	for( var y = 0; y < canvasH; y++ ){
		geom.vertices.push( new THREE.Vector3( canvasW - 1, -baseHeight, y ) );
	}	
	for( var x = 0; x < canvasW - 1; x++ ){
		var i0 = XMinOff + x;
		var i1 = XMinOff + x + 1;
		var i2 = x;
		var i3 = x + 1;

		geom.faces.push( new THREE.Face3( i2, i1, i0 ) );
		geom.faces.push( new THREE.Face3( i3, i1, i2 ) );
	}
	for( var x = 0; x < canvasW - 1; x++ ){
		var i0 = XMaxOff + x;
		var i1 = XMaxOff + x + 1;
		var i2 = ( canvasH - 1 ) * canvasW + x;
		var i3 = ( canvasH - 1 ) * canvasW + x + 1;

		geom.faces.push( new THREE.Face3( i1, i2, i0 ) );
		geom.faces.push( new THREE.Face3( i1, i3, i2 ) );
	}
	
	for( var y = 0; y < canvasH - 1; y++ ){
		var i0 = YMinOff + y;
		var i1 = YMinOff + y + 1;
		var i2 = y * canvasW;
		var i3 = ( y + 1 ) * canvasW;

		geom.faces.push( new THREE.Face3( i1, i2, i0 ) );
		geom.faces.push( new THREE.Face3( i1, i3, i2 ) );
	}
	for( var y = 0; y < canvasW - 1; y++ ){
		var i0 = YMaxOff + y;
		var i1 = YMaxOff + y + 1;
		var i2 = ( canvasW - 1 ) + y * canvasW;
		var i3 = ( canvasH - 1 ) + ( y + 1 ) * canvasW;

		geom.faces.push( new THREE.Face3( i2, i1, i0 ) );
		geom.faces.push( new THREE.Face3( i3, i1, i2 ) );
	}
	var grounPlaneOff = geom.vertices.length;
	geom.vertices.push( new THREE.Vector3( 0, -baseHeight, 0 ) );
	geom.vertices.push( new THREE.Vector3( 0, -baseHeight, canvasH - 1 ) );
	geom.vertices.push( new THREE.Vector3( canvasW - 1, -baseHeight, canvasH - 1 ) );
	geom.vertices.push( new THREE.Vector3( canvasW - 1, -baseHeight, 0 ) );

	geom.faces.push( new THREE.Face3( grounPlaneOff, grounPlaneOff + 1, grounPlaneOff + 2 ) );
	geom.faces.push( new THREE.Face3( grounPlaneOff + 0, grounPlaneOff + 2, grounPlaneOff + 3 ) );

	geom.mergeVertices();
	geom.computeFaceNormals();
	geom.computeVertexNormals();

	var mesh = new THREE.Mesh( geom, this.m_materials[ this.m_currentMaterialName ].clone() );
	mesh.matrixAutoUpdate = false;
	mesh.matrix = this.m_matrixStack[ this.m_matrixStack.length - 1 ].clone();
	mesh.matrixWorld = this.m_matrixStack[ this.m_matrixStack.length - 1 ].clone();
	this.m_scene.add( mesh );
	return( mesh );
}

KABK.Canvas3D.prototype.createBlobGeometry = function( binary, size, resolution, isoLevel ) {

	if( size === undefined ){
		size = new THREE.Vector3( 100, 100, 100 );
	}
	if( resolution === undefined ){
		resolution = new THREE.Vector3( 100, 100, 100 );
	}
	if( binary === undefined ){
		binary = false;
	}
	if( isoLevel === undefined ){
		isoLevel = 0.9;
	}

	if( this.m_mesh ){
		this.m_scene.remove( this.m_mesh );
	}

	var geometry = new THREE.Geometry();

    var data = new Float32Array( resolution.x * resolution.y * resolution.z );
    var points = [];
    var i = 0;
	for( var z = 0; z < resolution.z; z++ ){
		for( var y = 0; y < resolution.y; y++ ){
			for( var x = 0; x < resolution.x; x++ ){
				var p = new THREE.Vector3( ( x / resolution.x ) * size.x, ( y / resolution.y ) * size.y, ( z / resolution.z ) * size.z );
				points.push( p );
				var value = Number.MAX_VALUE;
				if( binary ){
					data[ i ] = 1.0;
				}
				for( var v = 0; v < this.m_volumes.length; v++ ){
					var newValue = this.m_volumes[ v ].evaluate( p );

					if( binary ){
						if( newValue > isoLevel ){
							data[ i ] = 0;
							break;
						}
						else{
							data[ i ] = 1;
						}
					}
					else{
//					else if( newValue < value ){
						data[ i ] += newValue;
//						value = newValue;
//					}
					}
				}
				i++;
		    }
		}
    }
	if( ! binary ){
/*		//MarchingCubes
		//MarchingTetrahedra
		//SurfaceNets
		var result = SurfaceNets( data, [ resolution.x, resolution.y, resolution.z ] );

		geometry.vertices.length = 0;
		geometry.faces.length = 0;

		for( var i = 0; i < result.vertices.length; i++ ){
			var v = result.vertices[ i ];
			geometry.vertices.push( new THREE.Vector3( ( v[ 0 ] / resolution.x ) * size.x, ( v[ 1 ] / resolution.y ) * size.y, ( v[ 2 ] / resolution.z ) * size.x ) );
		}

		for( var i = 0; i < result.faces.length; i++ ){
			var f = result.faces[ i ];
			if( f.length === 3 ){
				geometry.faces.push( new THREE.Face3( f[ 0 ], f[ 1 ], f[ 2 ] ) );
			} 
			else if( f.length === 4 ) {
				geometry.faces.push( new THREE.Face3( f[ 0 ], f[ 1 ], f[ 2 ] ) );
				geometry.faces.push( new THREE.Face3( f[ 0 ], f[ 2 ], f[ 3 ] ) );
			} 
			else {
				//Polygon needs to be subdivided
			}
		}
*/
		var vertexIndex = 0;
		// Vertices may occur along edges of cube, when the values at the edge's endpoints
		// straddle the isoLevel value.
		// Actual position along edge weighted according to function values.
		var vlist = new Array( 12 );

		for( var z = 0; z < resolution.z - 1; z++ ){
			for( var y = 0; y < resolution.y - 1; y++ ){
				for( var x = 0; x < resolution.x - 1; x++ ){
					// index of base point, and also adjacent points on cube
					var p = x + resolution.x * y + resolution.x * resolution.y * z,
						px   = p   + 1,
						py   = p   + resolution.x,
						pxy  = py  + 1,
						pz   = p   + resolution.x * resolution.y,
						pxz  = px  + resolution.x * resolution.y,
						pyz  = py  + resolution.x * resolution.y,
						pxyz = pxy + resolution.x * resolution.y;
					
					// store scalar this.m_values corresponding to vertices
					var value0 = data[ p    ],
						value1 = data[ px   ],
						value2 = data[ py   ],
						value3 = data[ pxy  ],
						value4 = data[ pz   ],
						value5 = data[ pxz  ],
						value6 = data[ pyz  ],
						value7 = data[ pxyz ];
					
					// set bit positions corresponding to vertices whose
					// isovalue is less than given constant.
					
					
					
					var cubeindex = 0;
					if( value0 < isoLevel ){
						cubeindex |= 1;
					}
					if( value1 < isoLevel ){
						cubeindex |= 2;
					}
					if( value2 < isoLevel ){
						cubeindex |= 8;
					}
					if( value3 < isoLevel ){
						cubeindex |= 4;
					}
					if( value4 < isoLevel ){
						cubeindex |= 16;
					}
					if( value5 < isoLevel ){
						cubeindex |= 32;
					}
					if( value6 < isoLevel ){
						cubeindex |= 128;
					}
					if( value7 < isoLevel ){
						cubeindex |= 64;
					}
					
					// bits = 12 bit number, indicates which edges are crossed by the isosurface
					var bits = THREE.edgeTable[ cubeindex ];
					
					// if none are crossed, proceed to next iteration
					if ( bits !== 0 ){
						// check which edges are crossed, and estimate the point location
						// using a weighted average of scalar this.m_values at edge endpoints.
						// store the vertex in an array for use later.
						var mu = 0.001; 
						
						// bottom of the cube
						if( bits & 1 ){
							mu = ( isoLevel - value0 ) / ( value1 - value0 );
							vlist[ 0 ]  = points[ p ].clone().lerp( points[ px ], mu );
						}
						if( bits & 2 ){
							mu = ( isoLevel - value1 ) / ( value3 - value1 );
							vlist[ 1 ]  = points[ px ].clone().lerp( points[ pxy ], mu );
						}
						if( bits & 4 ){
							mu = ( isoLevel - value2 ) / ( value3 - value2 );
							vlist[ 2 ]  = points[ py ].clone().lerp( points[ pxy ], mu );
						}
						if( bits & 8 ){
							mu = ( isoLevel - value0 ) / ( value2 - value0 );
							vlist[ 3 ]  = points[ p ].clone().lerp( points[ py ], mu );
						}
						// top of the cube
						if( bits & 16 ){
							mu = ( isoLevel - value4 ) / ( value5 - value4 );
							vlist[ 4 ]  = points[ pz ].clone().lerp( points[ pxz ], mu );
						}
						if( bits & 32 ){
							mu = ( isoLevel - value5 ) / ( value7 - value5 );
							vlist[ 5 ]  = points[ pxz ].clone().lerp( points[ pxyz ], mu );
						}
						if( bits & 64 ){
							mu = ( isoLevel - value6 ) / ( value7 - value6 );
							vlist[ 6 ]  = points[ pyz ].clone().lerp( points[ pxyz ], mu );
						}
						if( bits & 128 ){
							mu = ( isoLevel - value4 ) / ( value6 - value4 );
							vlist[ 7 ]  = points[ pz ].clone().lerp( points[ pyz ], mu );
						}
						// vertical lines of the cube
						if( bits & 256 ){
							mu = ( isoLevel - value0 ) / ( value4 - value0 );
							vlist[ 8 ]  = points[ p ].clone().lerp( points[ pz ], mu );
						}
						if( bits & 512 ){
							mu = ( isoLevel - value1 ) / ( value5 - value1 );
							vlist[ 9 ]  = points[ px ].clone().lerp( points[ pxz ], mu );
						}
						if( bits & 1024 ){
							mu = ( isoLevel - value3 ) / ( value7 - value3 );
							vlist[ 10 ] = points[ pxy ].clone().lerp( points[ pxyz ], mu );
						}
						if( bits & 2048 ){
							mu = ( isoLevel - value2 ) / ( value6 - value2 );
							vlist[ 11 ] = points[ py ].clone().lerp( points[ pyz ], mu );
						}
						
						// construct triangles -- get correct vertices from triTable.
						var i = 0;
						cubeindex *= 16;
						// "Re-purpose cubeindex into an offset into triTable." 
						//  since each row really isn't a row.
						 
						// the while loop should run at most 5 times,
						// since the 16th entry in each row is a -1.
						while( THREE.triTable[ cubeindex + i ] != -1 ){
							var index3 = THREE.triTable[ cubeindex + i ];
							var index2 = THREE.triTable[ cubeindex + i + 1 ];
							var index1 = THREE.triTable[ cubeindex + i + 2 ];
							
							geometry.vertices.push( vlist[ index1 ].clone() );
							geometry.vertices.push( vlist[ index2 ].clone() );
							geometry.vertices.push( vlist[ index3 ].clone() );
							var face = new THREE.Face3( vertexIndex + 2, vertexIndex + 1, vertexIndex + 0 );
							geometry.faces.push( face );
							vertexIndex += 3;
							i += 3;
						}
					}
				}
			}
		}
	}
	else{

		var vertexIndex = 0;
		var isFilledX = false;
		var isFilledY = false;
		var isFilledZ = false;
		for( var z = 0; z < resolution.z - 1; z++ ){
			for( var y = 0; y < resolution.y - 1; y++ ){
				for( var x = 0; x < resolution.x - 1; x++ ){
					var i = z * resolution.x * resolution.y + y * resolution.x + x;
					var ix = i   + 1;
					var iy = i   + resolution.x;
					var iz = i   + resolution.x * resolution.y;
					var filled = data[ i ] > isoLevel;
					var filledX = data[ ix ] > isoLevel;
					var filledY = data[ iy ] > isoLevel;
					var filledZ = data[ iz ] > isoLevel;
					var offset = 0.5;
					var face1, face2;
					if( filled != filledX ){
						geometry.vertices.push( new THREE.Vector3( ( ( x + offset ) / resolution.x ) * size.x, ( ( y - 0.5 ) / resolution.y ) * size.y, ( ( z - 0.5 ) / resolution.z ) * size.z ) );
						geometry.vertices.push( new THREE.Vector3( ( ( x + offset ) / resolution.x ) * size.x, ( ( y + 0.5 ) / resolution.y ) * size.y, ( ( z - 0.5 ) / resolution.z ) * size.z ) );
						geometry.vertices.push( new THREE.Vector3( ( ( x + offset ) / resolution.x ) * size.x, ( ( y + 0.5 ) / resolution.y ) * size.y, ( ( z + 0.5 ) / resolution.z ) * size.z ) );
						geometry.vertices.push( new THREE.Vector3( ( ( x + offset ) / resolution.x ) * size.x, ( ( y - 0.5 ) / resolution.y ) * size.y, ( ( z + 0.5 ) / resolution.z ) * size.z ) );
						if( filled ){
							face1 = new THREE.Face3( vertexIndex, vertexIndex + 1, vertexIndex + 2 );
							face2 = new THREE.Face3( vertexIndex, vertexIndex + 2, vertexIndex + 3 );
						}
						else{
							face1 = new THREE.Face3( vertexIndex + 2, vertexIndex + 1, vertexIndex );
							face2 = new THREE.Face3( vertexIndex + 3, vertexIndex + 2, vertexIndex );
						}
						geometry.faces.push( face1 );
						geometry.faces.push( face2 );
						vertexIndex += 4;
					}
					if( filled != filledY ){
						geometry.vertices.push( new THREE.Vector3( ( ( x - 0.5 ) / resolution.x ) * size.x, ( ( y + offset ) / resolution.y ) * size.y, ( ( z - 0.5 ) / resolution.z ) * size.z ) );
						geometry.vertices.push( new THREE.Vector3( ( ( x + 0.5 ) / resolution.x ) * size.x, ( ( y + offset ) / resolution.y ) * size.y, ( ( z - 0.5 ) / resolution.z ) * size.z ) );
						geometry.vertices.push( new THREE.Vector3( ( ( x + 0.5 ) / resolution.x ) * size.x, ( ( y + offset ) / resolution.y ) * size.y, ( ( z + 0.5 ) / resolution.z ) * size.z ) );
						geometry.vertices.push( new THREE.Vector3( ( ( x - 0.5 ) / resolution.x ) * size.x, ( ( y + offset ) / resolution.y ) * size.y, ( ( z + 0.5 ) / resolution.z ) * size.z ) );
						if( filled ){
							face1 = new THREE.Face3( vertexIndex, vertexIndex + 1, vertexIndex + 2 );
							face2 = new THREE.Face3( vertexIndex, vertexIndex + 2, vertexIndex + 3 );
						}
						else{
							face1 = new THREE.Face3( vertexIndex + 2, vertexIndex + 1, vertexIndex );
							face2 = new THREE.Face3( vertexIndex + 3, vertexIndex + 2, vertexIndex );
						}
						geometry.faces.push( face1 );
						geometry.faces.push( face2 );
						vertexIndex += 4;
					}
					if( filled != filledZ ){
						geometry.vertices.push( new THREE.Vector3( ( ( x - 0.5 ) / resolution.x ) * size.x, ( ( y - 0.5 ) / resolution.y ) * size.y, ( ( z + offset ) / resolution.z ) * size.z ) );
						geometry.vertices.push( new THREE.Vector3( ( ( x + 0.5 ) / resolution.x ) * size.x, ( ( y - 0.5 ) / resolution.y ) * size.y, ( ( z + offset ) / resolution.z ) * size.z ) );
						geometry.vertices.push( new THREE.Vector3( ( ( x + 0.5 ) / resolution.x ) * size.x, ( ( y + 0.5 ) / resolution.y ) * size.y, ( ( z + offset ) / resolution.z ) * size.z ) );
						geometry.vertices.push( new THREE.Vector3( ( ( x - 0.5 ) / resolution.x ) * size.x, ( ( y + 0.5 ) / resolution.y ) * size.y, ( ( z + offset ) / resolution.z ) * size.z ) );
						if( filled ){
							face1 = new THREE.Face3( vertexIndex, vertexIndex + 1, vertexIndex + 2 );
							face2 = new THREE.Face3( vertexIndex, vertexIndex + 2, vertexIndex + 3 );
						}
						else{
							face1 = new THREE.Face3( vertexIndex + 2, vertexIndex + 1, vertexIndex );
							face2 = new THREE.Face3( vertexIndex + 3, vertexIndex + 2, vertexIndex );
						}
						geometry.faces.push( face1 );
						geometry.faces.push( face2 );
						vertexIndex += 4;
					}

				}
			}
		}
	}
	geometry.computeBoundingBox();
	geometry.computeBoundingSphere();
	geometry.mergeVertices();
	geometry.computeFaceNormals();
	geometry.computeVertexNormals();

	var mesh;
	if( binary ){
		mesh = new THREE.Mesh( geometry, this.m_materials.flat );
	}
	else{
		mesh = new THREE.Mesh( geometry, this.m_materials[ this.m_currentMaterialName ].clone() );
	}
	this.m_scene.add( mesh );
	return( mesh )
}	

KABK.Canvas3D.prototype.booleanOperation = function( a, b, operation ) {

	a.matrixWorld.decompose( a.position, a.quaternion, a.scale );
	b.matrixWorld.decompose( b.position, b.quaternion, b.scale );

	var ga = new THREE.Geometry();
	ga.faces = a.geometry.faces.slice();
	for( var i = 0; i < a.geometry.vertices.length; i++ ){
		ga.vertices[ i ] = a.geometry.vertices[ i ].clone();
		ga.vertices[ i ].applyMatrix4( a.matrixWorld );
	}
	var ma = new THREE.Mesh( ga, this.m_materials[ this.m_currentMaterialName ].clone() )

	var gb = new THREE.Geometry();
	gb.faces = b.geometry.faces.slice();
	for( var i = 0; i < b.geometry.vertices.length; i++ ){
		gb.vertices[ i ] = b.geometry.vertices[ i ].clone();
		gb.vertices[ i ].applyMatrix4( b.matrixWorld );
	}
	var mb = new THREE.Mesh( gb, this.m_materials[ this.m_currentMaterialName ].clone() )

	var ac = THREE.CSG.toCSG( ma );
	var bc = THREE.CSG.toCSG( mb );

	var s = ac[ operation ]( bc );

	var geom  = THREE.CSG.fromCSG( s );

	geom.mergeVertices();
	geom.computeFaceNormals();
	geom.computeVertexNormals();

	this.m_scene.remove( a );
	this.m_scene.remove( b );

	var mesh = new THREE.Mesh( geom, this.m_materials[ this.m_currentMaterialName ].clone() );
	this.m_scene.add( mesh );
	return( mesh );
}

KABK.Canvas3D.prototype.generateSTL = function() {
	var blob = THREE.CSG.toCSG( this.m_mesh ).toStlBinary();//fixTJunctions().

	window.URL = window.webkitURL || window.URL;

	var a = $( '<a>' );
	a.attr( 'download', 'file.stl' );
	a.attr( 'href', window.URL.createObjectURL( blob ) );
	a.attr( 'dataset.downloadurl', [ 'text/plain', 'file.stl', window.URL.createObjectURL( blob ) ].join(':') );
	a[ 0 ].click();
}

KABK.Canvas3D.prototype.saveOBJ = function() {
	var exporter = new THREE.OBJExporter();
	var data = exporter.parse( this.m_scene );

	var bb = new Blob( [ data ], { type:'text/plain' } );

	var a = $( '<a>' );
	a.attr( 'download', 'scene.obj' );
	a.attr( 'href', window.URL.createObjectURL( bb ) );
	a.attr( 'dataset.downloadurl', [ 'text/plain', 'scene.obj', window.URL.createObjectURL( bb ) ].join(':') );
	a[ 0 ].click();
}

KABK.Canvas3D.prototype.update = function(){
	if( this.m_cameraAngle == undefined ){
		this.m_cameraAngle = 0.0;
	}
	this.m_controls.update();
}

KABK.Canvas3D.prototype.draw = function(){
	this.m_renderer.render( this.m_scene, this.m_cameraTHREE );
}

KABK.Canvas3D.prototype.destroy = function(){
	this.dispatchEvent( new RT.Event( 'destroy', this, undefined ) );

  	this.destroyEventDispatcherInterface();
	this.destroyLayerInterface();
	this.destroyMouseInterface();
}


THREE.edgeTable = new Int32Array([
0x0  , 0x109, 0x203, 0x30a, 0x406, 0x50f, 0x605, 0x70c,
0x80c, 0x905, 0xa0f, 0xb06, 0xc0a, 0xd03, 0xe09, 0xf00,
0x190, 0x99 , 0x393, 0x29a, 0x596, 0x49f, 0x795, 0x69c,
0x99c, 0x895, 0xb9f, 0xa96, 0xd9a, 0xc93, 0xf99, 0xe90,
0x230, 0x339, 0x33 , 0x13a, 0x636, 0x73f, 0x435, 0x53c,
0xa3c, 0xb35, 0x83f, 0x936, 0xe3a, 0xf33, 0xc39, 0xd30,
0x3a0, 0x2a9, 0x1a3, 0xaa , 0x7a6, 0x6af, 0x5a5, 0x4ac,
0xbac, 0xaa5, 0x9af, 0x8a6, 0xfaa, 0xea3, 0xda9, 0xca0,
0x460, 0x569, 0x663, 0x76a, 0x66 , 0x16f, 0x265, 0x36c,
0xc6c, 0xd65, 0xe6f, 0xf66, 0x86a, 0x963, 0xa69, 0xb60,
0x5f0, 0x4f9, 0x7f3, 0x6fa, 0x1f6, 0xff , 0x3f5, 0x2fc,
0xdfc, 0xcf5, 0xfff, 0xef6, 0x9fa, 0x8f3, 0xbf9, 0xaf0,
0x650, 0x759, 0x453, 0x55a, 0x256, 0x35f, 0x55 , 0x15c,
0xe5c, 0xf55, 0xc5f, 0xd56, 0xa5a, 0xb53, 0x859, 0x950,
0x7c0, 0x6c9, 0x5c3, 0x4ca, 0x3c6, 0x2cf, 0x1c5, 0xcc ,
0xfcc, 0xec5, 0xdcf, 0xcc6, 0xbca, 0xac3, 0x9c9, 0x8c0,
0x8c0, 0x9c9, 0xac3, 0xbca, 0xcc6, 0xdcf, 0xec5, 0xfcc,
0xcc , 0x1c5, 0x2cf, 0x3c6, 0x4ca, 0x5c3, 0x6c9, 0x7c0,
0x950, 0x859, 0xb53, 0xa5a, 0xd56, 0xc5f, 0xf55, 0xe5c,
0x15c, 0x55 , 0x35f, 0x256, 0x55a, 0x453, 0x759, 0x650,
0xaf0, 0xbf9, 0x8f3, 0x9fa, 0xef6, 0xfff, 0xcf5, 0xdfc,
0x2fc, 0x3f5, 0xff , 0x1f6, 0x6fa, 0x7f3, 0x4f9, 0x5f0,
0xb60, 0xa69, 0x963, 0x86a, 0xf66, 0xe6f, 0xd65, 0xc6c,
0x36c, 0x265, 0x16f, 0x66 , 0x76a, 0x663, 0x569, 0x460,
0xca0, 0xda9, 0xea3, 0xfaa, 0x8a6, 0x9af, 0xaa5, 0xbac,
0x4ac, 0x5a5, 0x6af, 0x7a6, 0xaa , 0x1a3, 0x2a9, 0x3a0,
0xd30, 0xc39, 0xf33, 0xe3a, 0x936, 0x83f, 0xb35, 0xa3c,
0x53c, 0x435, 0x73f, 0x636, 0x13a, 0x33 , 0x339, 0x230,
0xe90, 0xf99, 0xc93, 0xd9a, 0xa96, 0xb9f, 0x895, 0x99c,
0x69c, 0x795, 0x49f, 0x596, 0x29a, 0x393, 0x99 , 0x190,
0xf00, 0xe09, 0xd03, 0xc0a, 0xb06, 0xa0f, 0x905, 0x80c,
0x70c, 0x605, 0x50f, 0x406, 0x30a, 0x203, 0x109, 0x0])

THREE.triTable = new Int32Array([
-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
0, 8, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
0, 1, 9, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
1, 8, 3, 9, 8, 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
1, 2, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
0, 8, 3, 1, 2, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
9, 2, 10, 0, 2, 9, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
2, 8, 3, 2, 10, 8, 10, 9, 8, -1, -1, -1, -1, -1, -1, -1,
3, 11, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
0, 11, 2, 8, 11, 0, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
1, 9, 0, 2, 3, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
1, 11, 2, 1, 9, 11, 9, 8, 11, -1, -1, -1, -1, -1, -1, -1,
3, 10, 1, 11, 10, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
0, 10, 1, 0, 8, 10, 8, 11, 10, -1, -1, -1, -1, -1, -1, -1,
3, 9, 0, 3, 11, 9, 11, 10, 9, -1, -1, -1, -1, -1, -1, -1,
9, 8, 10, 10, 8, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
4, 7, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
4, 3, 0, 7, 3, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
0, 1, 9, 8, 4, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
4, 1, 9, 4, 7, 1, 7, 3, 1, -1, -1, -1, -1, -1, -1, -1,
1, 2, 10, 8, 4, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
3, 4, 7, 3, 0, 4, 1, 2, 10, -1, -1, -1, -1, -1, -1, -1,
9, 2, 10, 9, 0, 2, 8, 4, 7, -1, -1, -1, -1, -1, -1, -1,
2, 10, 9, 2, 9, 7, 2, 7, 3, 7, 9, 4, -1, -1, -1, -1,
8, 4, 7, 3, 11, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
11, 4, 7, 11, 2, 4, 2, 0, 4, -1, -1, -1, -1, -1, -1, -1,
9, 0, 1, 8, 4, 7, 2, 3, 11, -1, -1, -1, -1, -1, -1, -1,
4, 7, 11, 9, 4, 11, 9, 11, 2, 9, 2, 1, -1, -1, -1, -1,
3, 10, 1, 3, 11, 10, 7, 8, 4, -1, -1, -1, -1, -1, -1, -1,
1, 11, 10, 1, 4, 11, 1, 0, 4, 7, 11, 4, -1, -1, -1, -1,
4, 7, 8, 9, 0, 11, 9, 11, 10, 11, 0, 3, -1, -1, -1, -1,
4, 7, 11, 4, 11, 9, 9, 11, 10, -1, -1, -1, -1, -1, -1, -1,
9, 5, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
9, 5, 4, 0, 8, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
0, 5, 4, 1, 5, 0, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
8, 5, 4, 8, 3, 5, 3, 1, 5, -1, -1, -1, -1, -1, -1, -1,
1, 2, 10, 9, 5, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
3, 0, 8, 1, 2, 10, 4, 9, 5, -1, -1, -1, -1, -1, -1, -1,
5, 2, 10, 5, 4, 2, 4, 0, 2, -1, -1, -1, -1, -1, -1, -1,
2, 10, 5, 3, 2, 5, 3, 5, 4, 3, 4, 8, -1, -1, -1, -1,
9, 5, 4, 2, 3, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
0, 11, 2, 0, 8, 11, 4, 9, 5, -1, -1, -1, -1, -1, -1, -1,
0, 5, 4, 0, 1, 5, 2, 3, 11, -1, -1, -1, -1, -1, -1, -1,
2, 1, 5, 2, 5, 8, 2, 8, 11, 4, 8, 5, -1, -1, -1, -1,
10, 3, 11, 10, 1, 3, 9, 5, 4, -1, -1, -1, -1, -1, -1, -1,
4, 9, 5, 0, 8, 1, 8, 10, 1, 8, 11, 10, -1, -1, -1, -1,
5, 4, 0, 5, 0, 11, 5, 11, 10, 11, 0, 3, -1, -1, -1, -1,
5, 4, 8, 5, 8, 10, 10, 8, 11, -1, -1, -1, -1, -1, -1, -1,
9, 7, 8, 5, 7, 9, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
9, 3, 0, 9, 5, 3, 5, 7, 3, -1, -1, -1, -1, -1, -1, -1,
0, 7, 8, 0, 1, 7, 1, 5, 7, -1, -1, -1, -1, -1, -1, -1,
1, 5, 3, 3, 5, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
9, 7, 8, 9, 5, 7, 10, 1, 2, -1, -1, -1, -1, -1, -1, -1,
10, 1, 2, 9, 5, 0, 5, 3, 0, 5, 7, 3, -1, -1, -1, -1,
8, 0, 2, 8, 2, 5, 8, 5, 7, 10, 5, 2, -1, -1, -1, -1,
2, 10, 5, 2, 5, 3, 3, 5, 7, -1, -1, -1, -1, -1, -1, -1,
7, 9, 5, 7, 8, 9, 3, 11, 2, -1, -1, -1, -1, -1, -1, -1,
9, 5, 7, 9, 7, 2, 9, 2, 0, 2, 7, 11, -1, -1, -1, -1,
2, 3, 11, 0, 1, 8, 1, 7, 8, 1, 5, 7, -1, -1, -1, -1,
11, 2, 1, 11, 1, 7, 7, 1, 5, -1, -1, -1, -1, -1, -1, -1,
9, 5, 8, 8, 5, 7, 10, 1, 3, 10, 3, 11, -1, -1, -1, -1,
5, 7, 0, 5, 0, 9, 7, 11, 0, 1, 0, 10, 11, 10, 0, -1,
11, 10, 0, 11, 0, 3, 10, 5, 0, 8, 0, 7, 5, 7, 0, -1,
11, 10, 5, 7, 11, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
10, 6, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
0, 8, 3, 5, 10, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
9, 0, 1, 5, 10, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
1, 8, 3, 1, 9, 8, 5, 10, 6, -1, -1, -1, -1, -1, -1, -1,
1, 6, 5, 2, 6, 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
1, 6, 5, 1, 2, 6, 3, 0, 8, -1, -1, -1, -1, -1, -1, -1,
9, 6, 5, 9, 0, 6, 0, 2, 6, -1, -1, -1, -1, -1, -1, -1,
5, 9, 8, 5, 8, 2, 5, 2, 6, 3, 2, 8, -1, -1, -1, -1,
2, 3, 11, 10, 6, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
11, 0, 8, 11, 2, 0, 10, 6, 5, -1, -1, -1, -1, -1, -1, -1,
0, 1, 9, 2, 3, 11, 5, 10, 6, -1, -1, -1, -1, -1, -1, -1,
5, 10, 6, 1, 9, 2, 9, 11, 2, 9, 8, 11, -1, -1, -1, -1,
6, 3, 11, 6, 5, 3, 5, 1, 3, -1, -1, -1, -1, -1, -1, -1,
0, 8, 11, 0, 11, 5, 0, 5, 1, 5, 11, 6, -1, -1, -1, -1,
3, 11, 6, 0, 3, 6, 0, 6, 5, 0, 5, 9, -1, -1, -1, -1,
6, 5, 9, 6, 9, 11, 11, 9, 8, -1, -1, -1, -1, -1, -1, -1,
5, 10, 6, 4, 7, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
4, 3, 0, 4, 7, 3, 6, 5, 10, -1, -1, -1, -1, -1, -1, -1,
1, 9, 0, 5, 10, 6, 8, 4, 7, -1, -1, -1, -1, -1, -1, -1,
10, 6, 5, 1, 9, 7, 1, 7, 3, 7, 9, 4, -1, -1, -1, -1,
6, 1, 2, 6, 5, 1, 4, 7, 8, -1, -1, -1, -1, -1, -1, -1,
1, 2, 5, 5, 2, 6, 3, 0, 4, 3, 4, 7, -1, -1, -1, -1,
8, 4, 7, 9, 0, 5, 0, 6, 5, 0, 2, 6, -1, -1, -1, -1,
7, 3, 9, 7, 9, 4, 3, 2, 9, 5, 9, 6, 2, 6, 9, -1,
3, 11, 2, 7, 8, 4, 10, 6, 5, -1, -1, -1, -1, -1, -1, -1,
5, 10, 6, 4, 7, 2, 4, 2, 0, 2, 7, 11, -1, -1, -1, -1,
0, 1, 9, 4, 7, 8, 2, 3, 11, 5, 10, 6, -1, -1, -1, -1,
9, 2, 1, 9, 11, 2, 9, 4, 11, 7, 11, 4, 5, 10, 6, -1,
8, 4, 7, 3, 11, 5, 3, 5, 1, 5, 11, 6, -1, -1, -1, -1,
5, 1, 11, 5, 11, 6, 1, 0, 11, 7, 11, 4, 0, 4, 11, -1,
0, 5, 9, 0, 6, 5, 0, 3, 6, 11, 6, 3, 8, 4, 7, -1,
6, 5, 9, 6, 9, 11, 4, 7, 9, 7, 11, 9, -1, -1, -1, -1,
10, 4, 9, 6, 4, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
4, 10, 6, 4, 9, 10, 0, 8, 3, -1, -1, -1, -1, -1, -1, -1,
10, 0, 1, 10, 6, 0, 6, 4, 0, -1, -1, -1, -1, -1, -1, -1,
8, 3, 1, 8, 1, 6, 8, 6, 4, 6, 1, 10, -1, -1, -1, -1,
1, 4, 9, 1, 2, 4, 2, 6, 4, -1, -1, -1, -1, -1, -1, -1,
3, 0, 8, 1, 2, 9, 2, 4, 9, 2, 6, 4, -1, -1, -1, -1,
0, 2, 4, 4, 2, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
8, 3, 2, 8, 2, 4, 4, 2, 6, -1, -1, -1, -1, -1, -1, -1,
10, 4, 9, 10, 6, 4, 11, 2, 3, -1, -1, -1, -1, -1, -1, -1,
0, 8, 2, 2, 8, 11, 4, 9, 10, 4, 10, 6, -1, -1, -1, -1,
3, 11, 2, 0, 1, 6, 0, 6, 4, 6, 1, 10, -1, -1, -1, -1,
6, 4, 1, 6, 1, 10, 4, 8, 1, 2, 1, 11, 8, 11, 1, -1,
9, 6, 4, 9, 3, 6, 9, 1, 3, 11, 6, 3, -1, -1, -1, -1,
8, 11, 1, 8, 1, 0, 11, 6, 1, 9, 1, 4, 6, 4, 1, -1,
3, 11, 6, 3, 6, 0, 0, 6, 4, -1, -1, -1, -1, -1, -1, -1,
6, 4, 8, 11, 6, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
7, 10, 6, 7, 8, 10, 8, 9, 10, -1, -1, -1, -1, -1, -1, -1,
0, 7, 3, 0, 10, 7, 0, 9, 10, 6, 7, 10, -1, -1, -1, -1,
10, 6, 7, 1, 10, 7, 1, 7, 8, 1, 8, 0, -1, -1, -1, -1,
10, 6, 7, 10, 7, 1, 1, 7, 3, -1, -1, -1, -1, -1, -1, -1,
1, 2, 6, 1, 6, 8, 1, 8, 9, 8, 6, 7, -1, -1, -1, -1,
2, 6, 9, 2, 9, 1, 6, 7, 9, 0, 9, 3, 7, 3, 9, -1,
7, 8, 0, 7, 0, 6, 6, 0, 2, -1, -1, -1, -1, -1, -1, -1,
7, 3, 2, 6, 7, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
2, 3, 11, 10, 6, 8, 10, 8, 9, 8, 6, 7, -1, -1, -1, -1,
2, 0, 7, 2, 7, 11, 0, 9, 7, 6, 7, 10, 9, 10, 7, -1,
1, 8, 0, 1, 7, 8, 1, 10, 7, 6, 7, 10, 2, 3, 11, -1,
11, 2, 1, 11, 1, 7, 10, 6, 1, 6, 7, 1, -1, -1, -1, -1,
8, 9, 6, 8, 6, 7, 9, 1, 6, 11, 6, 3, 1, 3, 6, -1,
0, 9, 1, 11, 6, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
7, 8, 0, 7, 0, 6, 3, 11, 0, 11, 6, 0, -1, -1, -1, -1,
7, 11, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
7, 6, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
3, 0, 8, 11, 7, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
0, 1, 9, 11, 7, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
8, 1, 9, 8, 3, 1, 11, 7, 6, -1, -1, -1, -1, -1, -1, -1,
10, 1, 2, 6, 11, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
1, 2, 10, 3, 0, 8, 6, 11, 7, -1, -1, -1, -1, -1, -1, -1,
2, 9, 0, 2, 10, 9, 6, 11, 7, -1, -1, -1, -1, -1, -1, -1,
6, 11, 7, 2, 10, 3, 10, 8, 3, 10, 9, 8, -1, -1, -1, -1,
7, 2, 3, 6, 2, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
7, 0, 8, 7, 6, 0, 6, 2, 0, -1, -1, -1, -1, -1, -1, -1,
2, 7, 6, 2, 3, 7, 0, 1, 9, -1, -1, -1, -1, -1, -1, -1,
1, 6, 2, 1, 8, 6, 1, 9, 8, 8, 7, 6, -1, -1, -1, -1,
10, 7, 6, 10, 1, 7, 1, 3, 7, -1, -1, -1, -1, -1, -1, -1,
10, 7, 6, 1, 7, 10, 1, 8, 7, 1, 0, 8, -1, -1, -1, -1,
0, 3, 7, 0, 7, 10, 0, 10, 9, 6, 10, 7, -1, -1, -1, -1,
7, 6, 10, 7, 10, 8, 8, 10, 9, -1, -1, -1, -1, -1, -1, -1,
6, 8, 4, 11, 8, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
3, 6, 11, 3, 0, 6, 0, 4, 6, -1, -1, -1, -1, -1, -1, -1,
8, 6, 11, 8, 4, 6, 9, 0, 1, -1, -1, -1, -1, -1, -1, -1,
9, 4, 6, 9, 6, 3, 9, 3, 1, 11, 3, 6, -1, -1, -1, -1,
6, 8, 4, 6, 11, 8, 2, 10, 1, -1, -1, -1, -1, -1, -1, -1,
1, 2, 10, 3, 0, 11, 0, 6, 11, 0, 4, 6, -1, -1, -1, -1,
4, 11, 8, 4, 6, 11, 0, 2, 9, 2, 10, 9, -1, -1, -1, -1,
10, 9, 3, 10, 3, 2, 9, 4, 3, 11, 3, 6, 4, 6, 3, -1,
8, 2, 3, 8, 4, 2, 4, 6, 2, -1, -1, -1, -1, -1, -1, -1,
0, 4, 2, 4, 6, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
1, 9, 0, 2, 3, 4, 2, 4, 6, 4, 3, 8, -1, -1, -1, -1,
1, 9, 4, 1, 4, 2, 2, 4, 6, -1, -1, -1, -1, -1, -1, -1,
8, 1, 3, 8, 6, 1, 8, 4, 6, 6, 10, 1, -1, -1, -1, -1,
10, 1, 0, 10, 0, 6, 6, 0, 4, -1, -1, -1, -1, -1, -1, -1,
4, 6, 3, 4, 3, 8, 6, 10, 3, 0, 3, 9, 10, 9, 3, -1,
10, 9, 4, 6, 10, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
4, 9, 5, 7, 6, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
0, 8, 3, 4, 9, 5, 11, 7, 6, -1, -1, -1, -1, -1, -1, -1,
5, 0, 1, 5, 4, 0, 7, 6, 11, -1, -1, -1, -1, -1, -1, -1,
11, 7, 6, 8, 3, 4, 3, 5, 4, 3, 1, 5, -1, -1, -1, -1,
9, 5, 4, 10, 1, 2, 7, 6, 11, -1, -1, -1, -1, -1, -1, -1,
6, 11, 7, 1, 2, 10, 0, 8, 3, 4, 9, 5, -1, -1, -1, -1,
7, 6, 11, 5, 4, 10, 4, 2, 10, 4, 0, 2, -1, -1, -1, -1,
3, 4, 8, 3, 5, 4, 3, 2, 5, 10, 5, 2, 11, 7, 6, -1,
7, 2, 3, 7, 6, 2, 5, 4, 9, -1, -1, -1, -1, -1, -1, -1,
9, 5, 4, 0, 8, 6, 0, 6, 2, 6, 8, 7, -1, -1, -1, -1,
3, 6, 2, 3, 7, 6, 1, 5, 0, 5, 4, 0, -1, -1, -1, -1,
6, 2, 8, 6, 8, 7, 2, 1, 8, 4, 8, 5, 1, 5, 8, -1,
9, 5, 4, 10, 1, 6, 1, 7, 6, 1, 3, 7, -1, -1, -1, -1,
1, 6, 10, 1, 7, 6, 1, 0, 7, 8, 7, 0, 9, 5, 4, -1,
4, 0, 10, 4, 10, 5, 0, 3, 10, 6, 10, 7, 3, 7, 10, -1,
7, 6, 10, 7, 10, 8, 5, 4, 10, 4, 8, 10, -1, -1, -1, -1,
6, 9, 5, 6, 11, 9, 11, 8, 9, -1, -1, -1, -1, -1, -1, -1,
3, 6, 11, 0, 6, 3, 0, 5, 6, 0, 9, 5, -1, -1, -1, -1,
0, 11, 8, 0, 5, 11, 0, 1, 5, 5, 6, 11, -1, -1, -1, -1,
6, 11, 3, 6, 3, 5, 5, 3, 1, -1, -1, -1, -1, -1, -1, -1,
1, 2, 10, 9, 5, 11, 9, 11, 8, 11, 5, 6, -1, -1, -1, -1,
0, 11, 3, 0, 6, 11, 0, 9, 6, 5, 6, 9, 1, 2, 10, -1,
11, 8, 5, 11, 5, 6, 8, 0, 5, 10, 5, 2, 0, 2, 5, -1,
6, 11, 3, 6, 3, 5, 2, 10, 3, 10, 5, 3, -1, -1, -1, -1,
5, 8, 9, 5, 2, 8, 5, 6, 2, 3, 8, 2, -1, -1, -1, -1,
9, 5, 6, 9, 6, 0, 0, 6, 2, -1, -1, -1, -1, -1, -1, -1,
1, 5, 8, 1, 8, 0, 5, 6, 8, 3, 8, 2, 6, 2, 8, -1,
1, 5, 6, 2, 1, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
1, 3, 6, 1, 6, 10, 3, 8, 6, 5, 6, 9, 8, 9, 6, -1,
10, 1, 0, 10, 0, 6, 9, 5, 0, 5, 6, 0, -1, -1, -1, -1,
0, 3, 8, 5, 6, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
10, 5, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
11, 5, 10, 7, 5, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
11, 5, 10, 11, 7, 5, 8, 3, 0, -1, -1, -1, -1, -1, -1, -1,
5, 11, 7, 5, 10, 11, 1, 9, 0, -1, -1, -1, -1, -1, -1, -1,
10, 7, 5, 10, 11, 7, 9, 8, 1, 8, 3, 1, -1, -1, -1, -1,
11, 1, 2, 11, 7, 1, 7, 5, 1, -1, -1, -1, -1, -1, -1, -1,
0, 8, 3, 1, 2, 7, 1, 7, 5, 7, 2, 11, -1, -1, -1, -1,
9, 7, 5, 9, 2, 7, 9, 0, 2, 2, 11, 7, -1, -1, -1, -1,
7, 5, 2, 7, 2, 11, 5, 9, 2, 3, 2, 8, 9, 8, 2, -1,
2, 5, 10, 2, 3, 5, 3, 7, 5, -1, -1, -1, -1, -1, -1, -1,
8, 2, 0, 8, 5, 2, 8, 7, 5, 10, 2, 5, -1, -1, -1, -1,
9, 0, 1, 5, 10, 3, 5, 3, 7, 3, 10, 2, -1, -1, -1, -1,
9, 8, 2, 9, 2, 1, 8, 7, 2, 10, 2, 5, 7, 5, 2, -1,
1, 3, 5, 3, 7, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
0, 8, 7, 0, 7, 1, 1, 7, 5, -1, -1, -1, -1, -1, -1, -1,
9, 0, 3, 9, 3, 5, 5, 3, 7, -1, -1, -1, -1, -1, -1, -1,
9, 8, 7, 5, 9, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
5, 8, 4, 5, 10, 8, 10, 11, 8, -1, -1, -1, -1, -1, -1, -1,
5, 0, 4, 5, 11, 0, 5, 10, 11, 11, 3, 0, -1, -1, -1, -1,
0, 1, 9, 8, 4, 10, 8, 10, 11, 10, 4, 5, -1, -1, -1, -1,
10, 11, 4, 10, 4, 5, 11, 3, 4, 9, 4, 1, 3, 1, 4, -1,
2, 5, 1, 2, 8, 5, 2, 11, 8, 4, 5, 8, -1, -1, -1, -1,
0, 4, 11, 0, 11, 3, 4, 5, 11, 2, 11, 1, 5, 1, 11, -1,
0, 2, 5, 0, 5, 9, 2, 11, 5, 4, 5, 8, 11, 8, 5, -1,
9, 4, 5, 2, 11, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
2, 5, 10, 3, 5, 2, 3, 4, 5, 3, 8, 4, -1, -1, -1, -1,
5, 10, 2, 5, 2, 4, 4, 2, 0, -1, -1, -1, -1, -1, -1, -1,
3, 10, 2, 3, 5, 10, 3, 8, 5, 4, 5, 8, 0, 1, 9, -1,
5, 10, 2, 5, 2, 4, 1, 9, 2, 9, 4, 2, -1, -1, -1, -1,
8, 4, 5, 8, 5, 3, 3, 5, 1, -1, -1, -1, -1, -1, -1, -1,
0, 4, 5, 1, 0, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
8, 4, 5, 8, 5, 3, 9, 0, 5, 0, 3, 5, -1, -1, -1, -1,
9, 4, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
4, 11, 7, 4, 9, 11, 9, 10, 11, -1, -1, -1, -1, -1, -1, -1,
0, 8, 3, 4, 9, 7, 9, 11, 7, 9, 10, 11, -1, -1, -1, -1,
1, 10, 11, 1, 11, 4, 1, 4, 0, 7, 4, 11, -1, -1, -1, -1,
3, 1, 4, 3, 4, 8, 1, 10, 4, 7, 4, 11, 10, 11, 4, -1,
4, 11, 7, 9, 11, 4, 9, 2, 11, 9, 1, 2, -1, -1, -1, -1,
9, 7, 4, 9, 11, 7, 9, 1, 11, 2, 11, 1, 0, 8, 3, -1,
11, 7, 4, 11, 4, 2, 2, 4, 0, -1, -1, -1, -1, -1, -1, -1,
11, 7, 4, 11, 4, 2, 8, 3, 4, 3, 2, 4, -1, -1, -1, -1,
2, 9, 10, 2, 7, 9, 2, 3, 7, 7, 4, 9, -1, -1, -1, -1,
9, 10, 7, 9, 7, 4, 10, 2, 7, 8, 7, 0, 2, 0, 7, -1,
3, 7, 10, 3, 10, 2, 7, 4, 10, 1, 10, 0, 4, 0, 10, -1,
1, 10, 2, 8, 7, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
4, 9, 1, 4, 1, 7, 7, 1, 3, -1, -1, -1, -1, -1, -1, -1,
4, 9, 1, 4, 1, 7, 0, 8, 1, 8, 7, 1, -1, -1, -1, -1,
4, 0, 3, 7, 4, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
4, 8, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
9, 10, 8, 10, 11, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
3, 0, 9, 3, 9, 11, 11, 9, 10, -1, -1, -1, -1, -1, -1, -1,
0, 1, 10, 0, 10, 8, 8, 10, 11, -1, -1, -1, -1, -1, -1, -1,
3, 1, 10, 11, 3, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
1, 2, 11, 1, 11, 9, 9, 11, 8, -1, -1, -1, -1, -1, -1, -1,
3, 0, 9, 3, 9, 11, 1, 2, 9, 2, 11, 9, -1, -1, -1, -1,
0, 2, 11, 8, 0, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
3, 2, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
2, 3, 8, 2, 8, 10, 10, 8, 9, -1, -1, -1, -1, -1, -1, -1,
9, 10, 2, 0, 9, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
2, 3, 8, 2, 8, 10, 0, 1, 8, 1, 10, 8, -1, -1, -1, -1,
1, 10, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
1, 3, 8, 9, 1, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
0, 9, 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
0, 3, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1]);
