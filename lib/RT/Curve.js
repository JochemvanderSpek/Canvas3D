"use strict";


RT.Curve = function( ){
	this.m_interpolationType = RT.Curve.INTERPOLATION_LINEAR;
	this.m_subdiv = 0;
	this.m_closed = false;
	this.m_knots = new Array();
	this.m_weights = new Array();
	this.m_points = new Array();
	this.m_tangents = new Array();
	this.m_length = 0.0;
	this.m_useChordLength = false;

	return( this );
}

RT.Curve.INTERPOLATION_LINEAR 	= 1;
RT.Curve.INTERPOLATION_HERMITE 	= 2;

RT.Curve.prototype.initialize = function() {
	/// points & tangents is what we calculate from the knots
	this.m_points.clear();
	this.m_tangents.clear();

	if( this.m_knots.length < 2 ){
		this.m_points = this.m_knots.shallowCopy();
	}
	else{
		switch( this.m_interpolationType ){
			case RT.Curve.INTERPOLATION_LINEAR:
				if( this.m_subdiv == 0 ){
					/// don't need to do anything
					this.m_points = this.m_knots.shallowCopy();
				}
				else{
					/// subdivide the curve given by this.m_knots
					var newCurve = new Array();
					var newWeights = new Array();
					var prevCurve = this.m_knots.shallowCopy();
					var prevWeights = this.m_weights.shallowCopy();
					for( var i = 0; i < this.m_subdiv; i++ ){
						/// start a new iteration with an empty curve
						newCurve.clear();
						newWeights.clear();

						if( ! this.m_closed ){
							// keep the first point
							newCurve.push( prevCurve[ 0 ] );
							newWeights.push( prevWeights[ 0 ] );
							for( var j = 0; j < prevCurve.length - 1; j++ ) {
								var p0 = prevCurve[ j ];
								var p1 = prevCurve[ j + 1 ];

								var w0 = prevWeights[ j ];
								var w1 = prevWeights[ j + 1 ];

								newCurve.push( RT.Vec2.lerp( p0, p1, 0.25 - w0 * 0.25 ) );
								newCurve.push( RT.Vec2.lerp( p0, p1, 0.75 + w1 * 0.25 ) );

								newWeights.push( w0 );
								newWeights.push( w1 );
							}
							/// keep the last point
							newCurve.push( prevCurve[ prevCurve.length - 1 ] );
							newWeights.push( prevWeights[ prevWeights.length - 1 ] );
						}
						else{
							for( var j = 0; j < prevCurve.length; j++ ) {
								var p0 = prevCurve[ j ];
								var p1 = prevCurve[ ( j + 1 ) % prevCurve.length ];

								var w0 = prevWeights[ j ];
								var w1 = prevWeights[ j + 1 ];

								newCurve.push( RT.Vec2.lerp( p0, p1, 0.25 - w0 * 0.25 ) );
								newCurve.push( RT.Vec2.lerp( p0, p1, 0.75 + w1 * 0.25 ) );

								newWeights.push( w0 );
								newWeights.push( w1 );
							}
						}
						/// keep the new curve
						prevCurve = newCurve.shallowCopy();
						prevWeights = newWeights.shallowCopy();
					}

					/// store the smoothed curve
					this.m_points = newCurve.shallowCopy();

					/// calculate the tangents for each point
					for( var i = 0; i < this.m_points.length; i++ ){
						i1 = i;
						i2 = i + 1;
						if( i == this.m_points.length - 1 ){
							if( this.m_closed ){
								i2 = 0;
							}
							else{
								i1 = this.m_points.length - 2;
								i2 = this.m_points.length - 1;
							}
						}
						this.m_tangents.push( RT.Vec2.normalized( RT.Vec2.difference( this.m_points[ i2 ], this.m_points[ i1 ] ) ) );
					}
				}
				break;
			case RT.Curve.INTERPOLATION_HERMITE:
				/// interpolate and store in this.m_points
				for( var i = 0; i < this.m_knots.length; i++ ){

					/// find the four vertices 'surrounding' [i] and [i+1]
					var v0, v1, v2, v3;

					/// we look at segment i, i+1
					var i1 = i;
					var i2 = i + 1;

					if( i == this.m_knots.length - 1 ){
						/// if we're on the last point
						if( this.m_closed ){
							/// if closed, bridge the gap
							i2 = 0;
						}
						else{
							/// if open, don't start a new segment
							break;
						}
					}

					/// check if we're on the first segment
					if( i1 == 0 ){
						if( this.m_closed ){
							/// wrap around to the last point
							v0 = this.m_knots[ this.m_knots.length - 1 ];
						}
						else{
							/// extend the first segment 'backwards' 
							v0 = RT.Vec2.difference( this.m_knots[ 0 ], RT.Vec2.difference( this.m_knots[ 1 ], this.m_knots[ 0 ] ) );
						}
					}
					else{
						/// take the previous point
						v0 = this.m_knots[ i1 - 1 ];
					}

					/// this is the actual segment we want to process
					v1 = this.m_knots[ i1 ];
					v2 = this.m_knots[ i2 ];

					var w1 = this.m_weights[ i1 ];
					var w2 = this.m_weights[ i2 ];

					/// check if we're on the last segment
					if( i2 == this.m_knots.length - 1 ){
						if( this.m_closed ){
							/// if closed, wrap to the beginning
							v3 = this.m_knots[ 0 ];
						}
						else{
							/// else extend the last segment by itself
							v3 = RT.Vec2.sum( this.m_knots[ this.m_knots.length - 1 ], RT.Vec2.difference( this.m_knots[ this.m_knots.length - 1 ], this.m_knots[ this.m_knots.length - 2 ] ) );
						}
					}
					else{
						/// take the next knot-point
						v3 = this.m_knots[ i2 + 1 ];
					}

					/// process v1->v2
					for( var j = 0; j <= this.m_subdiv; j++ ){
						var f = j / this.m_subdiv;

						/// make sure we don't include the endpoint
						if( j == this.m_subdiv ){
							/// if we're not processing the last segment (open or closed)
							if( ! ( ( ( ! this.m_closed ) && ( i == this.m_knots.length - 2 ) ) ||
									  (   this.m_closed   && ( i == this.m_knots.length - 1 ) ) ) ){
								break;
							}
						}

						/// @see http://local.wasp.uwa.edu.au/~pbourke/miscellaneous/interpolation/
						var s0 = new RT.Vec2();
						var s1 = new RT.Vec2();
						var f2, f3;
						var a0, a1, a2, a3;

						f2 = f * f;
						f3 = f2 * f;

						var v01 = RT.Vec2.difference( v1, v0 );
						var v12 = RT.Vec2.difference( v2, v1 );
						var v23 = RT.Vec2.difference( v3, v2 );

						s0.setsca( v01, 0.25 - w1 * 0.25 );
						s0.incsca( v12, 0.25 + w1 * 0.25 );
						s1.setsca( v12, 0.25 + w2 * 0.25 );
						s1.incsca( v23, 0.25 - w2 * 0.25 );

						a0 =  2.0 * f3 - 3.0 * f2 + 1.0;
						a1 =        f3 - 2.0 * f2 + f;
						a2 =        f3 -       f2;
						a3 = -2.0 * f3 + 3.0 * f2;

						var v = new RT.Vec2( 0.0, 0.0 );
						v.incsca( v1, a0 );
						v.incsca( s0, a1 );
						v.incsca( s1, a2 );
						v.incsca( v2, a3 );

						this.m_points.push( v );

						/// average & interpolate the tangents
						var t1 = RT.Vec2.normalized( v01 );
						var t2 = RT.Vec2.normalized( v12 );
						var t3 = RT.Vec2.normalized( v23 );

						///@todo: make sure we don't get degenerate tangents
						this.m_tangents.push( RT.Vec2.normalized( RT.Vec2.lerp( RT.Vec2.average( t1, t2 ), RT.Vec2.average( t2, t3 ), f ) ) );
					}
					if( this.m_closed ){
						// remove the last point if closed (don't want to double coords)
						this.m_points.pop();
						this.m_tangents.pop();
					}
				}
				break;
		}
	}
	this.m_length = 0.0;
	if( this.m_closed ){
		for( var i = 0; i < this.m_points.length; i++ ){
			this.m_length += RT.Vec2.difference( this.m_points[ i ], this.m_points[ ( i + 1 ) % this.m_points.length ] ).getlen();
		}
	}
	else{
		for( var i = 0; i < this.m_points.length - 1; i++ ){
			this.m_length += RT.Vec2.difference( this.m_points[ i ], this.m_points[ i + 1 ] ).getlen();
		}
	}

}

RT.Curve.prototype.setUseChordLength = function( state ){
	this.m_useChordLength = state;
}

RT.Curve.prototype.clone = function(){
	var clone = new RT.Curve();
	for( var i = 0; i < this.m_knots.length; i++ ){
		clone.m_knots.push( this.m_knots[ i ].clone() );
	}
	for( var i = 0; i < this.m_weights.length; i++ ){
		clone.m_weights.push( this.m_weights[ i ] );
	}
	for( var i = 0; i < this.m_points.length; i++ ){
		clone.m_points.push( this.m_points[ i ].clone() );
	}
	for( var i = 0; i < this.m_tangents.length; i++ ){
		clone.m_tangents.push( this.m_tangents[ i ].clone() );
	}
	clone.m_interpolationType = this.m_interpolationType;
	clone.m_subdiv = this.m_subdiv;
	clone.m_closed = this.m_closed;
	return( clone );
}

RT.Curve.prototype.getInterpolationType = function(){
	return( this.m_interpolationType ); 
}

RT.Curve.prototype.setInterpolationType = function( type, doRebuild ){
	this.m_interpolationType = type; 
	if( doRebuild ){
		this.initialize();
	}
}

RT.Curve.prototype.getSubdivision = function() { 
	return( this.m_subdiv ); 
}

RT.Curve.prototype.setSubdivision = function( sub, doRebuild ) { 
	this.m_subdiv = sub; 
	if( doRebuild ){
		this.initialize();
	}
}

RT.Curve.prototype.getClosed = function() { 
	return( this.m_closed ); 
}

RT.Curve.prototype.setClosed = function( state, doRebuild ) { 
	this.m_closed = state; 
	if( doRebuild ){
		this.initialize();
	}
}

RT.Curve.prototype.getLength = function() {
	return( this.m_length );
}

RT.Curve.prototype.getCenter = function() {
	if( ! m_points.length ){
		// TODO Error
	}
	var center = new RT.Vec2( 0.0, 0.0 );
	for( var i = 0; i < this.m_points.length; i++ ){
		center.inc( this.m_points[ i ] );
	}
	return( center.div( m_points.length ) );
}

RT.Curve.prototype.addKnot = function( knot, index, doRebuild ){
	if( index < 0 || index == undefined ){
		this.m_knots.push( knot );
		this.m_weights.push( 0.0 );
	}
	else if( index >= 0  && index < this.m_knots.length ){
		this.m_knots.splice( index, 0, knot );
		this.m_weights.splice( index, 0, 0.0 );
	}
	else{
		// TODO error
	}
	if( doRebuild ){
		this.initialize();
	}
}

RT.Curve.prototype.setKnot = function( knot, index, doRebuild ){
	if( index >= 0  && index < this.m_knots.length ){
		if( knot !== undefined ){
			this.m_knots[ index ] = knot;
		}
	}
	else{
		// TODO error
	}
	if( doRebuild ){
		this.initialize();
	}
}

RT.Curve.prototype.setWeight = function( weight, index, doRebuild ){
	if( index >= 0  && index < this.m_knots.length ){
		if( weight !== undefined ){
			this.m_weights[ index ] = weight;
		}
	}
	else{
		// TODO error
	}
	if( doRebuild ){
		this.initialize();
	}
}

RT.Curve.prototype.removeKnot = function( index, doRebuild ){
	if( index >= 0  && index < this.m_knots.length ){
		this.m_knots.splice( index, 1 );
		this.m_weights.splice( index, 1 );
	}
	else{
		// TODO error
	}
	if( doRebuild ){
		this.initialize();
	}
}

RT.Curve.prototype.clear = function(){
	this.m_knots.clear();
	this.m_weights.clear();
	this.m_points.clear();
	this.m_tangents.clear();
	this.m_length = 0.0;
}

RT.Curve.prototype.getKnot = function( index ){
	if( index >= 0  && index < this.m_knots.length ){
		return( this.m_knots[ index ] );
	}
	else{
		// TODO error
	}
}

RT.Curve.prototype.getWeight = function( index ){
	if( index >= 0  && index < this.m_weights.length ){
		return( this.m_weights[ index ] );
	}
	else{
		// TODO error
	}
}

RT.Curve.prototype.getNumKnots = function() {
	return( this.m_knots.length );
}

RT.Curve.prototype.getKnots = function() {
	return( this.m_knots );
}

RT.Curve.prototype.getWeights = function() {
	return( this.m_weights );
}

RT.Curve.prototype.getNumPoints = function() {
	return( this.m_points.length );
}

RT.Curve.prototype.getPoints = function() {
	return( this.m_points );
}

RT.Curve.prototype.getPoints = function(){
	return( this.m_points );
}

RT.Curve.prototype.getPoint = function( index ){
	if( index >= 0  && index < this.m_points.length ){
		return( this.m_points[ index ] );
	}
	else{
		// TODO error
	}
}

RT.Curve.prototype.getNAABB = function(){
	var minX = Number.MAX_VALUE;
	var maxX = -Number.MAX_VALUE;
	var minY = Number.MAX_VALUE;
	var maxY = -Number.MAX_VALUE;
	for( var i = 0; i < this.m_points.length; i++ ){
		if( this.m_points[ i ].x < minX ){ minX = this.m_points[ i ].x; }
		if( this.m_points[ i ].x > maxX ){ maxX = this.m_points[ i ].x; }
		if( this.m_points[ i ].y < minY ){ minY = this.m_points[ i ].y; }
		if( this.m_points[ i ].y > maxY ){ maxY = this.m_points[ i ].y; }
	}
	return { 'minX':minX, 'maxX':maxX, 'minY':minY, 'maxY':maxY };
}

RT.Curve.prototype.getKnotsNAABB = function(){
	var minX = Number.MAX_VALUE;
	var maxX = -Number.MAX_VALUE;
	var minY = Number.MAX_VALUE;
	var maxY = -Number.MAX_VALUE;
	for( var i = 0; i < this.m_knots.length; i++ ){
		if( this.m_knots[ i ].x < minX ){ minX = this.m_knots[ i ].x; }
		if( this.m_knots[ i ].x > maxX ){ maxX = this.m_knots[ i ].x; }
		if( this.m_knots[ i ].y < minY ){ minY = this.m_knots[ i ].y; }
		if( this.m_knots[ i ].y > maxY ){ maxY = this.m_knots[ i ].y; }
	}
	return { 'minX':minX, 'maxX':maxX, 'minY':minY, 'maxY':maxY };
}

RT.Curve.prototype.getInterpolatedPoint = function( param ){
	var lowerIndex;
	var upperIndex;
	var overshoot;
	if( this.m_points.length == 0 ){
		return( undefined );
	}
	else if( this.m_points.length == 1 ){
		return( this.m_points[ 0 ].clone() );
	}
	else if( param == 0.0 ){
		return( this.m_points[ 0 ].clone() );
	}
	else if( param == 1.0 ){
		if( this.m_closed ){
			return( this.m_points[ 0 ].clone() );
		}
		else{
			return( this.m_points[ this.m_points.length - 1 ].clone() );
		}
	}

	if( this.m_useChordLength ){
		if( this.m_closed ){
			var length = 0.0;
			for( var i = 0; i < this.m_points.length; i++ ){
				var segment = RT.Vec2.difference( this.m_points[ i ], this.m_points[ ( i + 1 ) % this.m_points.length ] ).getlen();
				var prevParam = ( length / this.m_length );
				var nextParam = ( ( length + segment ) / this.m_length );
				if( nextParam > param ){
					lowerIndex = i;
					upperIndex = ( lowerIndex + 1 ) % this.m_points.length;
					overshoot = ( param - prevParam ) / ( nextParam - prevParam );
					break;
				}
				length += segment;
			}
		}
		else{
			var length = 0.0;
			for( var i = 0; i < this.m_points.length - 1; i++ ){
				var segment = RT.Vec2.difference( this.m_points[ i ], this.m_points[ i + 1 ] ).getlen();
				var prevParam = ( length / this.m_length );
				var nextParam = ( ( length + segment ) / this.m_length );
				if( nextParam > param ){
					lowerIndex = i;
					upperIndex = lowerIndex + 1;
					overshoot = ( param - prevParam ) / ( nextParam - prevParam );
					break;
				}
				length += segment;
			}
		}
	}		
	else{
		if( this.m_closed ){
			var scaledParam = param * ( this.m_points.length );
			lowerIndex = Math.min( math.max( Math.floor( scaledParam ), 0 ), Math.max( this.m_points.length - 1, 0 ) );
			upperIndex = ( lowerIndex + 1 ) % this.m_points.length;
		}
		else{
			var scaledParam = param * ( this.m_points.length - 1 );
			lowerIndex = Math.min( Math.max( Math.floor( scaledParam ), 0 ), Math.max( this.m_points.length - 2, 0 ) );
			upperIndex = lowerIndex + 1;
		}
		overshoot = scaledParam - lowerIndex;
	}

	if( lowerIndex < this.m_points.length && upperIndex < this.m_points.length ){
		return( RT.Vec2.lerp( this.m_points[ lowerIndex ], this.m_points[ upperIndex ], overshoot ) );
	}
	else{
		// TODO error
	}
}


RT.Curve.prototype.binarySearch = function( v, p1, p2, epsilon, depth ) {
	if( epsilon === undefined ){
		epsilon = 0.0000001;
	}
	if( depth === undefined ){
		depth = 0;
	}
	else{
		depth++;
	}

	var d = ( p2 - p1 );

	// if the interval gets too small or we recurse too deeply, return
	if( d < epsilon ){
		return( p1 );
	}

	var pp1 = p1 + 0.333333 * d;
	var pp2 = p1 + 0.666667 * d;
	var v1 = this.getInterpolatedPoint( pp1 );
	var v2 = this.getInterpolatedPoint( pp2 );
	var d1, d2;
	if( v.x !== undefined && v.y === undefined ){
		d1 = Math.abs( v1.x - v.x );
		d2 = Math.abs( v2.x - v.x );
	}
	else if( v.x === undefined && v.y !== undefined ){
		d1 = Math.abs( v1.y - v.y );
		d2 = Math.abs( v2.y - v.y );
	}
	else if( v.x !== undefined && v.y !== undefined ){
		d1 = RT.Vec2.distance( v1, v );
		d2 = RT.Vec2.distance( v2, v );
	}

//	if( depth > 10 ){
//		RT.trace( '[p1,p2] = ['+p1.toFixed( 4 )+','+p2.toFixed( 4 )+'] => [d1,d2] = ['+d1.toFixed( 4 )+','+d2.toFixed( 4 )+']' );
//	}

	if( d1 <= epsilon ){
		return( pp1 );
	}
	else if( d2 <= epsilon ){
		return( pp2 );
	}
	else if( d1 < d2 ){
		return( this.binarySearch( v, p1, p1 + 0.5 * d, epsilon, depth ) );
	}
	else{
		return( this.binarySearch( v, p1 + 0.5 * d, p2, epsilon, depth ) );
	}

	RT.error( 'Curve::binarySearch failed' );
}

RT.Curve.prototype.getParam = function( p, epsilon ) {
	return( this.binarySearch( p, 0.0, 1.0, epsilon ) );
}

RT.Curve.prototype.getNumTangents = function() {
	return( this.m_tangents.length );
}

RT.Curve.prototype.getTangents = function() {
	return( this.m_tangents );
}

RT.Curve.prototype.getTangent = function( index ) {
	if( index >= 0  && index < this.m_tangents.length ){
		return( this.m_tangents[ index ] );
	}
	else{
		// TODO error
	}
}

RT.Curve.prototype.draw = function( context, options ) {
	for( var i = 0; i < this.m_points.length - 1; i++ ){
	 	context.strokeStyle = options.strokeStyle;
	 	context.lineWidth = options.lineWidth;
		context.beginPath();
		context.moveTo( this.m_points[ i ].x, this.m_points[ i ].y );
		context.lineTo( this.m_points[ i + 1 ].x, this.m_points[ i + 1 ].y );
		context.stroke();
	}
	if( this.m_closed ){
	 	context.strokeStyle = options.strokeStyle;
	 	context.lineWidth = options.lineWidth;
		context.beginPath();
		context.moveTo( this.points[ this.m_points.length - 1 ].x, this.points[ this.m_points.length - 1 ].y );
		context.lineTo( this.points[ 0 ].x, this.points[ 0 ].y );
		context.stroke();
	}
	if( options.Points ){
		for( var i = 0; i < this.m_points.length; i++ ){
			this.m_points[ i ].draw( context, options.Points );
		}
	}
	if( options.Knots ){
		for( var i = 0; i < this.m_knots.length; i++ ){
			this.m_knots[ i ].draw( context, options.Knots );
		}
	}
}


