"use strict";


RT.SpringConstraint = function( verletPoint1, verletPoint2, constant, scale ){
	this.createEventDispatcherInterface();
	this.m_v1 = verletPoint1;
	this.m_v2 = verletPoint2;
	this.m_constant = constant || 0.8;
	this.m_scale = scale || 1.0;
	this.m_defaultLength = RT.Vec2.distance( this.m_v1.m_cur, this.m_v2.m_cur );
	this.m_breakDistance = Number.MAX_VALUE;
	return( this );
}

RT.addInterface( RT.SpringConstraint, RT.EventDispatcherInterface );

RT.SpringConstraint.prototype.initialize = function() {
	this.initializeEventDispatcherInterface();
}

RT.SpringConstraint.prototype.setDefaultLength = function( length ) {
	this.m_defaultLength = length;
}

RT.SpringConstraint.prototype.getDefaultLength = function() {
	return( this.m_defaultLength );
}

RT.SpringConstraint.prototype.setConstant = function( c ) {
	this.m_constant = c;
}	

RT.SpringConstraint.prototype.setScale = function( s ) {
	this.m_scale = s;
}	

RT.SpringConstraint.prototype.update = function() {
	if( this.m_v1.getFixed() && this.m_v2.getFixed() ){
		return;
	}

	var difference = RT.Vec2.difference( this.m_v2.m_cur, this.m_v1.m_cur );
	var length = difference.getlen();

	if( this.m_breakDistance < Number.MAX_VALUE ){
		if( length >= this.m_breakDistance ){
			this.dispatchEvent( new RT.Event( 'break', this, undefined ) );
		}
	}

	difference.normalize();
	var d = 0.5 * this.m_constant * ( this.m_defaultLength * this.m_scale - length );
	if( ! this.m_v1.getFixed() ){
		this.m_v1.m_cur.decsca( difference, d );
	}
	if( ! this.m_v2.getFixed() ){
		this.m_v2.m_cur.incsca( difference, d );
	}

}

RT.SpringConstraint.prototype.setBreakDistance = function( d ) {
	this.m_breakDistance = d;
}

RT.SpringConstraint.prototype.draw = function( context, options ) {

	var fillStyle = 'rgb( 255, 255, 0)';
	var strokeStyle = 'rgb( 255, 0, 0)';
	var strokeStyleDefault = 'rgb( 255, 128, 0)';
	var lineWidth = 2;
	var lineCap = 'round';
	if( options ){
		if( options.fillStyle !== undefined ){
			fillStyle = options.fillStyle;
		}
		if( options.strokeStyle !== undefined ){
			strokeStyle = options.strokeStyle;
		}
		if( options.strokeStyleDefault !== undefined ){
			strokeStyleDefault = options.strokeStyleDefault;
		}
		if( options.lineWidth !== undefined ){
			lineWidth = options.lineWidth;
		}
		if( options.lineCap !== undefined ){
			lineCap = options.lineCap;
		}
	}

	context.save();
 	context.strokeStyle = strokeStyle;
 	context.lineWidth = lineWidth;
	context.lineCap = lineCap;
	context.beginPath();
	context.moveTo( this.m_v1.m_cur.x, this.m_v1.m_cur.y );
	context.lineTo( this.m_v2.m_cur.x, this.m_v2.m_cur.y );
	context.stroke();

	if( options && options.drawDefault ){
		if( strokeStyleDefault ){
			var n = RT.Vec2.difference( this.m_v2.m_cur, this.m_v1.m_cur );
			n.normalize();

			var center = RT.Vec2.average( this.m_v1.m_cur, this.m_v2.m_cur );
			var p1 = center.clone();
			p1.decsca( n, 0.5 * this.m_defaultLength * this.m_scale );
			var p2 = center.clone();
			p2.incsca( n, 0.5 * this.m_defaultLength * this.m_scale );

		 	context.strokeStyle = strokeStyleDefault;
			context.beginPath();
			context.moveTo( p1.x, p1.y );
			context.lineTo( p2.x, p2.y );
			context.stroke();
		}
	}
	context.restore();
}

RT.SpringConstraint.prototype.destroy = function() {
	this.dispatchEvent( new RT.Event( 'destroy', this, undefined ) );
  	this.destroyEventDispatcherInterface();
}

