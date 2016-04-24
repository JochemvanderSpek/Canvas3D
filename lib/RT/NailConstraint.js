"use strict";


RT.NailConstraint = function( fixedPoint, verletPoint, constant ){
	this.createEventDispatcherInterface();
	this.m_fixedPoint = fixedPoint;
	this.m_v = verletPoint;
	this.m_constant = constant || 0.8;
	this.m_breakDistance = Number.MAX_VALUE;
	return( this );
}

RT.addInterface( RT.NailConstraint, RT.EventDispatcherInterface );

RT.NailConstraint.prototype.initialize = function() {
	this.initializeEventDispatcherInterface();
}

RT.NailConstraint.prototype.update = function() {
	if( this.m_v.getFixed() ){
		return;
	}

	var difference = RT.Vec2.difference( this.m_v.m_cur, this.m_fixedPoint );
	if( this.m_breakDistance < Number.MAX_VALUE ){
		if( difference.getlen() >= this.m_breakDistance ){
			this.dispatchEvent( new RT.Event( 'break', this, undefined ) );
		}
	}

	difference.sca( this.m_constant );
	difference.inc( this.m_fixedPoint );

	this.m_v.m_cur.set( difference );
}

RT.NailConstraint.prototype.setNailPosition = function( p ) {
	this.m_fixedPoint.set( p );
}

RT.NailConstraint.prototype.setBreakDistance = function( d ) {
	this.m_breakDistance = d;
}

RT.NailConstraint.prototype.draw = function( context, options ) {
 	context.strokeStyle = options.strokeStyle;
 	context.lineWidth = options.lineWidth;
	context.beginPath();
	context.moveTo( this.m_fixedPoint.x, this.m_fixedPoint.y );
	context.lineTo( this.m_v.m_cur.x, this.m_v.m_cur.y );
	context.stroke();
}

RT.NailConstraint.prototype.destroy = function() {
	this.dispatchEvent( new RT.Event( 'destroy', this, undefined ) );
  	this.destroyEventDispatcherInterface();
}

