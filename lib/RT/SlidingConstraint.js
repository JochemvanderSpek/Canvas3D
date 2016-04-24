"use strict";


RT.SlidingConstraint = function( point1, point2, verletPoint3 ){
	this.createEventDispatcherInterface();
	this.m_v1 = point1;
	this.m_v2 = point2;
	this.m_v3 = verletPoint3;
	return( this );
}

RT.addInterface( RT.SlidingConstraint, RT.EventDispatcherInterface );

RT.SlidingConstraint.prototype.initialize = function() {
	this.initializeEventDispatcherInterface();
}

RT.SlidingConstraint.prototype.update = function() {
	if( this.m_v3.getFixed() ){
		return;
	}
	//         v3                            
	//        /                             
	//       /                              
	//      r                             
	//     /                                
	//    /  d                              
	//   v1---->|-------v2                                                      
	//   |-t->|
	var t = RT.Vec2.difference( this.m_v2, this.m_v1 );
	var tl = t.getlen();
	t.sca( 1.0 / tl );
	var r = RT.Vec2.difference( this.m_v3.m_cur, this.m_v1 );
	var d = t.dot( r ) / tl;

	// clamp d between 0 and 1
	d = Math.max( Math.min( d, 1.0 ), 0.0 );

	// 3 is the linear interpolation point between v1 and v2
	this.m_v3.m_cur = RT.Vec2.lerp( this.m_v1, this.m_v2, d );
}

RT.SlidingConstraint.prototype.draw = function( context, options ) {
 	context.strokeStyle = options.strokeStyle;
 	context.lineWidth = options.lineWidth;
	context.beginPath();
	context.moveTo( this.m_v1.x, this.m_v1.y );
	context.lineTo( this.m_v2.x, this.m_v2.y );
	context.stroke();
}

RT.SlidingConstraint.prototype.destroy = function() {
	this.dispatchEvent( new RT.Event( 'destroy', this, undefined ) );
  	this.destroyEventDispatcherInterface();
}

