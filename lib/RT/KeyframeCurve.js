"use strict";

RT.KeyframeCurve = function( numberOfFrames, interpolationType, subdivision ){
	this.createEventDispatcherInterface();

	this.m_frames = new Array();
	// numberOfFrames MUST be > 1
	var n = numberOfFrames;
	for( var i = 0; i < n; i++ ){
		this.m_frames[ i ] = undefined;
	}
	this.m_curveX = new RT.Curve(); 
	this.m_curveY = new RT.Curve();
	this.m_vertices = new Array();
	
	this.m_curveX.setSubdivision( subdivision || 0 );
	this.m_curveY.setSubdivision( subdivision || 0 );
	
	this.m_curveX.setUseChordLength( false );
	this.m_curveY.setUseChordLength( false );

	this.m_curveX.setInterpolationType( interpolationType || RT.Curve.INTERPOLATION_LINEAR ); 
	this.m_curveY.setInterpolationType( interpolationType || RT.Curve.INTERPOLATION_LINEAR );
}

RT.addInterface( RT.KeyframeCurve, RT.EventDispatcherInterface );

RT.KeyframeCurve.prototype.initialize = function() {
	this.initializeEventDispatcherInterface();

	this.m_curveX.initialize(); 
	this.m_curveY.initialize();

	this.rebuild();

    this.m_initialized = true;
	this.dispatchEvent( new RT.Event( 'initialize', this, undefined ) );
}

RT.KeyframeCurve.prototype.toJSON = function() {
	var object = {};
	object[ 'numberOfFrames' ] = this.m_frames.length;
	object[ 'subdiv' ] = this.m_curveX.getSubdivision();
	object[ 'type' ] = this.m_curveX.getInterpolationType();
	object[ 'keys' ] = {};
	for( var i = 0; i < this.m_frames.length; i++ ){
		if( this.m_frames[ i ] ){
			object.keys[ i ] = {};
			object.keys[ i ][ 'time' ] = this.m_frames[ i ].time;
			object.keys[ i ][ 'position' ] = this.m_frames[ i ].position.clone();
			object.keys[ i ][ 'weight' ] = this.m_frames[ i ].weight;
		}
	}
	return( object );
}

RT.KeyframeCurve.prototype.fromJSON = function( object ) {
	this.m_frames = new Array();
	var n = parseInt( object.numberOfFrames );
	for( var i = 0; i < n; i++ ){
		this.m_frames[ i ] = undefined;
	}
	this.m_curveX = new RT.Curve(); 
	this.m_curveY = new RT.Curve();
	
	this.m_curveX.setSubdivision( object.subdiv || 0 );
	this.m_curveY.setSubdivision( object.subdiv || 0 );

	this.m_curveX.setInterpolationType( object.type || RT.Curve.INTERPOLATION_LINEAR ); 
	this.m_curveY.setInterpolationType( object.type || RT.Curve.INTERPOLATION_LINEAR );

	for( var i in object.keys ){
		var p = new RT.Vec2( object.keys[ i ].position );
		this.m_frames[ i ] = { 'time':object.keys[ i ].time, 'position':p, 'weight':object.keys[ i ].weight };
	}
	this.dispatchEvent( new RT.Event( 'changed', this, 'fromJSON' ) );
}

RT.KeyframeCurve.prototype.transform = function( viaFunction, sendEvent ) {
	for( var i = 0; i < this.m_frames.length; i++ ){
		if( this.m_frames[ i ] ){
			this.m_frames[ i ].position = viaFunction( this.m_frames[ i ].position );
		}
	}
	this.dispatchEvent( new RT.Event( 'changed', this, 'transform' ) );
	this.rebuild();
}

RT.KeyframeCurve.prototype.setInterpolationType = function( type ) {
	type = type || RT.Curve.INTERPOLATION_LINEAR;
	if( type != this.m_curveX.getInterpolationType() ){
		this.m_curveX.setInterpolationType( type ); 
		this.m_curveY.setInterpolationType( type );
		this.rebuild();
		this.dispatchEvent( new RT.Event( 'changed', this, 'setInterpolationType' ) );
	}
}

RT.KeyframeCurve.prototype.getInterpolationType = function() {
	return( this.m_curveX.getInterpolationType() );
}

RT.KeyframeCurve.prototype.setSubdivision = function( subdiv ) {
	if( subdiv != this.m_curveX.getSubdivision() ){
		this.m_curveX.setSubdivision( subdiv );
		this.m_curveY.setSubdivision( subdiv );
		this.rebuild();
		this.dispatchEvent( new RT.Event( 'changed', this, 'setSubdivision' ) );
	}
}

RT.KeyframeCurve.prototype.getSubdivision = function() {
	return( this.m_curveX.getSubdivision() );
}

RT.KeyframeCurve.prototype.setUseChordLength = function( state ) {
	if( state != this.m_curveX.getUseChordLength() ){
		this.m_curveX.setUseChordLength( state );
		this.m_curveY.setUseChordLength( state );
		this.rebuild();
		this.dispatchEvent( new RT.Event( 'changed', this, 'setUseChordLength' ) );
	}
}

RT.KeyframeCurve.prototype.clear = function() {
	for( var i = 0; i < this.m_frames.length; i++ ){
		this.m_frames[ i ] = undefined;
	}
	this.rebuild();
}

RT.KeyframeCurve.prototype.setKeyframe = function( frame, position, doRebuild ) {
	// time runs from [0,1]
	var changed = false;
	var time = frame / ( this.m_frames.length - 1 );
	var weight = 0.0;
	if( this.m_frames[ frame ] ){
		weight = this.m_frames[ frame ].weight;
		if( position.x != this.m_frames[ frame ].position.x ||
			position.y != this.m_frames[ frame ].position.y ){
			changed = true;
		}
	}
	else{
		changed = true;
	}
	if( changed ){
		this.m_frames[ frame ] = { 'time':time, 'position':position, 'weight':weight };

		if( doRebuild ){
			this.rebuild();
		}
		this.dispatchEvent( new RT.Event( 'changed', this, 'setKeyframe' ) );
	}
}

RT.KeyframeCurve.prototype.copyKeyframe = function( frame ) {
	if( this.m_frames[ frame ] ){
		return( { 'time':this.m_frames[ frame ].time, 'position':this.m_frames[ frame ].position.clone(), 'weight':this.m_frames[ frame ].weight } );
	}
	else{
		return( undefined );
	}
}

RT.KeyframeCurve.prototype.pasteKeyframe = function( frame, keyframe, doRebuild ) {
	this.setKeyframe( frame, keyframe.position, doRebuild );
	if( keyframe.weight ){
		this.setKeyframeWeight( frame, keyframe.weight, doRebuild );
	}
}

RT.KeyframeCurve.prototype.setKeyframeWeight = function( frame, weight, doRebuild ) {
	if( this.m_frames[ frame ] && this.m_frames[ frame ].weight != weight ){
		this.m_frames[ frame ].weight = weight;

		if( doRebuild ){
			this.rebuild();
		}
		this.dispatchEvent( new RT.Event( 'changed', this, 'setKeyframeWeight' ) );
	}
}

RT.KeyframeCurve.prototype.getKeyframeWeight = function( frame ) {
	if( this.m_frames[ frame ] ){
		return( this.m_frames[ frame ].weight );
	}
	return( undefined );
}

RT.KeyframeCurve.prototype.getKeyframePosition = function( frame ) {
	if( this.m_frames[ frame ] ){
		return( this.m_frames[ frame ].position );
	}
	return( undefined );
}

RT.KeyframeCurve.prototype.hasKeyframe = function( frame ) {
	if( frame === undefined ){
		for( var i = 0; i < this.m_frames.length; i++ ){
			if( this.m_frames[ i ] !== undefined ){
				return( true );
			}
		}
		return( false );
	}
	else{
		return( this.m_frames[ frame ] !== undefined );
	}
}

RT.KeyframeCurve.prototype.removeKeyframe = function( frame, doRebuild ) {
	if( this.m_frames[ frame ] ){
		this.m_frames[ frame ] = undefined;

		if( doRebuild ){
			this.rebuild();
		}
		this.dispatchEvent( new RT.Event( 'changed', this, 'removeKeyframe' ) );
	}
}

RT.KeyframeCurve.prototype.getKeyframe = function( frame ) {
	if( frame < 0 || frame >= this.m_frames.length ){
		// @TODO error
		return( undefined );
	}
	return( this.m_frames[ frame ] );
}

RT.KeyframeCurve.prototype.getKeyframePosition = function( frame ) {
	if( frame < 0 || frame >= this.m_frames.length ){
		// @TODO error
		return( undefined );
	}
	if( this.m_frames[ frame ] ){
		return( this.m_frames[ frame ].position );
	}
	else{
		return( undefined );
	}
}

RT.KeyframeCurve.prototype.getNumberOfFrames = function() {
	return( this.m_frames.length );
}

RT.KeyframeCurve.prototype.getInterpolatedPoint = function( frame ){
	// time runs from [0,1]
	var time = ( frame % this.m_frames.length ) / ( this.m_frames.length - 1 );
	return( this.getInterpolatedPointAtTime( time ) );
}

RT.KeyframeCurve.prototype.getInterpolatedPointAtTime = function( time ){

	if( this.m_curveX.m_points.length ){
		for( var i = 0; i < this.m_curveX.m_points.length; i++ ){
			if( this.m_curveX.m_points[ i ].x >= time ){
				if( ! i ){
					return( new RT.Vec2( { 'x':this.m_curveX.m_points[ i ].y, 'y':this.m_curveY.m_points[ i ].y } ) );
				}
				else{
					var d = ( this.m_curveX.m_points[ i ].x - this.m_curveX.m_points[ i - 1 ].x );
					var f = 1.0 - ( ( this.m_curveX.m_points[ i ].x - time ) / d );
					var x = f * this.m_curveX.m_points[ i ].y + ( 1.0 - f ) * this.m_curveX.m_points[ i - 1 ].y;
					var y = f * this.m_curveY.m_points[ i ].y + ( 1.0 - f ) * this.m_curveY.m_points[ i - 1 ].y;
					return( new RT.Vec2( { 'x':x, 'y':y } ) );
				}
			}
		}
		var n = this.m_curveX.m_points.length - 1;
		return( new RT.Vec2( { 'x':this.m_curveX.m_points[ n ].y, 'y':this.m_curveY.m_points[ n ].y } ) );
	}
}

RT.KeyframeCurve.prototype.offset = function( offset ){
	for( var i = 0; i < this.m_frames.length; i++ ){
		if( this.m_frames[ i ] ){
			this.m_frames[ i ].position.inc( offset );
		}
	}
	this.rebuild();
}

RT.KeyframeCurve.prototype.scale = function( scale ){
	for( var i = 0; i < this.m_frames.length; i++ ){
		if( this.m_frames[ i ] ){
			this.m_frames[ i ].position.mul( scale );
		}
	}
	this.rebuild();
}

RT.KeyframeCurve.prototype.rebuild = function(){

	this.m_curveX.clear();
	this.m_curveY.clear();

	// @TODO make loop by wrapping the curve around in 3D
	var fpx, fpy, px, py;
	for( var i = 0; i < this.m_frames.length; i++ ){
		if( this.m_frames[ i ] !== undefined ){
			px = this.m_frames[ i ].position.x;
			py = this.m_frames[ i ].position.y;
			if( ! fpx ){
				fpx = px;
				fpy = py;
			}

			this.m_curveX.addKnot( new RT.Vec2( this.m_frames[ i ].time, px ) );
			this.m_curveY.addKnot( new RT.Vec2( this.m_frames[ i ].time, py ) );

			var weight = this.m_frames[ i ].weight;
			this.m_curveX.setWeight( weight, this.m_curveX.getNumKnots() - 1 );
			this.m_curveY.setWeight( weight, this.m_curveY.getNumKnots() - 1 );
		}
	}
	// @TODO extrapolation
	if( fpx && fpy && ( this.m_frames[ 0 ] === undefined ) ){
		// if the first point is undefined, we copy the first position to time 0.0
		this.m_curveX.addKnot( new RT.Vec2( 0.0, fpx ), 0 );
		this.m_curveY.addKnot( new RT.Vec2( 0.0, fpy ), 0 );
	}
	if( px && py && ( this.m_frames[ this.m_frames.length - 1 ] === undefined ) ){
		// if the last point is undefined, we copy the previous position to time 1.0
		this.m_curveX.addKnot( new RT.Vec2( 1.0, px ) );
		this.m_curveY.addKnot( new RT.Vec2( 1.0, py ) );
	}

	this.m_curveX.initialize();
	this.m_curveY.initialize();
	this.m_vertices.length = 0;
	if( this.m_curveX.getNumKnots() > 0 ){

		// @TODO make this generic for 3D
		for( var i = 0; i < this.m_frames.length; i++ ){
			var knot = new RT.Vec2( this.getInterpolatedPoint( i ) );
			this.m_vertices.push( knot );
		}
	}
}

RT.KeyframeCurve.prototype.draw = function( context, options ) {
	var curveOptions = options || { 'strokeStyle':'rgba( 255, 0, 0, 0.8 )', 'lineWidth':1.0,
		'Points':{ 'fillStyle':'rgba( 255, 0, 0, 0.4 )', 'strokeStyle':'rgba( 255, 0, 0, 0.4 )', 'radius':0.5 },
		'Knots':{ 'fillStyle':'rgba( 255, 0, 0, 0.8 )', 'strokeStyle':'rgba( 255, 0, 0, 0.8 )', 'radius':1.0 }
	}
	for( var i = 0; i < this.m_vertices.length - 1; i++ ){
	 	context.strokeStyle = curveOptions.strokeStyle;
	 	context.lineWidth = curveOptions.lineWidth;
		context.beginPath();
		context.moveTo( this.m_vertices[ i ].x, this.m_vertices[ i ].y );
		context.lineTo( this.m_vertices[ i + 1 ].x, this.m_vertices[ i + 1 ].y );
		context.stroke();
	}

	var frames = { 'fillStyle':'rgba( 255, 0, 0, 0.8 )', 'strokeStyle':'rgba( 255, 0, 0, 0.8 )', 'radius':0.8 };
	for( var i = 0; i < this.m_frames.length; i++ ){
		var f = i / ( this.m_frames.length - 1 );
		var p = this.getInterpolatedPointAtTime( f );
		p.draw( context, frames );
	}

	var keyframes = { 'fillStyle':'rgba( 0, 0, 255, 0.8 )', 'strokeStyle':'rgba( 0, 0, 255, 0.8 )', 'radius':0.8 };
	for( var i = 0; i < this.m_frames.length; i++ ){
		if( this.m_frames[ i ] !== undefined ){
			this.m_frames[ i ].position.draw( context, keyframes );
		}
	}	
}

RT.KeyframeCurve.prototype.destroy = function() {
	this.dispatchEvent( new RT.Event( 'destroy', this, undefined ) );

	this.m_curveX.clear();
	this.m_curveY.clear();
	this.m_vertices.length = 0;

  	this.destroyEventDispatcherInterface();
}