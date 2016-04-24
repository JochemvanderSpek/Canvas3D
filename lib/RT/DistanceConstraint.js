"use strict";


RT.DistanceConstraint = function( verletPoint1, verletPoint2, min, max, unilateral ){
	this.createEventDispatcherInterface();
	this.m_v1 = verletPoint1;
	this.m_v2 = verletPoint2;
	this.m_minDistance = min || Number.MIN_VALUE;
	this.m_maxDistance = max || Number.MAX_VALUE;
	this.m_uniLateral = unilateral;
	return( this );
}

RT.addInterface( RT.DistanceConstraint, RT.EventDispatcherInterface );

RT.DistanceConstraint.prototype.initialize = function() {
	this.initializeEventDispatcherInterface();
}

RT.DistanceConstraint.prototype.update = function() {
	if( this.m_v1.getFixed() && this.m_v2.getFixed() ){
		return;
	}

	var difference = RT.Vec2.difference( this.m_v2.m_cur, this.m_v1.m_cur );
	var length = difference.getlen();
						
	difference.normalize();
	var d = 0.0;
	if( length < this.m_minDistance ){
		d = 0.5 * ( this.m_minDistance - length );
	}
	else if( length > this.m_maxDistance ){
		d = 0.5 * ( this.m_maxDistance - length );
	}
	if( d != 0.0 ){
		if( this.m_uniLateral ){
			d *= 2.0;
			if( ! this.m_v2.getFixed() ){
				this.m_v2.m_cur.incsca( difference, d );
			}
		}
		else{
			if( ! this.m_v1.getFixed() ){
				this.m_v1.m_cur.decsca( difference, d );
			}
			if( ! this.m_v2.getFixed() ){
				this.m_v2.m_cur.incsca( difference, d );
			}
		}
	}
}

RT.DistanceConstraint.prototype.setUniLateral = function( state ) {
	this.m_uniLateral = state;
}

RT.DistanceConstraint.prototype.getUniLateral = function( ) {
	return( this.m_uniLateral );
}

RT.DistanceConstraint.prototype.getDefaultlength = function( ) {
	return( this.m_maxDistance - this.m_minDistance );
}

RT.DistanceConstraint.prototype.draw = function( context, options ) {
 	context.strokeStyle = options.strokeStyle;
 	context.lineWidth = options.lineWidth;
	context.beginPath();
	context.moveTo( this.m_v1.m_cur.x, this.m_v1.m_cur.y );
	context.lineTo( this.m_v2.m_cur.x, this.m_v2.m_cur.y );
	context.stroke();

	// @TODO draw limits, unilateral..

	if( options.strokeStyleDefault ){
		var n = RT.Vec2.difference( this.m_v2.m_cur, this.m_v1.m_cur );
		n.normalize();

		var d = this.m_maxDistance - this.m_minDistance;

		var center = RT.Vec2.average( this.m_v1.m_cur, this.m_v2.m_cur );
		var p1 = center.clone();
		p1.decsca( n, 0.5 * d );
		var p2 = center.clone();
		p2.incsca( n, 0.5 * d );

	 	context.strokeStyle = options.strokeStyleDefault;
		context.beginPath();
		context.moveTo( p1.x, p1.y );
		context.lineTo( p2.x, p2.y );
		context.stroke();
	}
}

RT.DistanceConstraint.prototype.destroy = function() {
	this.dispatchEvent( new RT.Event( 'destroy', this, undefined ) );
  	this.destroyEventDispatcherInterface();
}

