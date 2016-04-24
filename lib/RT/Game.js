"use strict";

/*
RT.Game = function( name ){
	this.createMouseInterface();

	this.m_world = null;

	this.m_selectedBody = null;
	this.m_mouseJoint = null;

	this.m_dragState = 0;
	this.m_dragOffset = new RT.Vec2();
}

var mouseInterfaceConfig = RT.MouseInterface.Config();
mouseInterfaceConfig.mouseOrigin = { x:10, y:-10 };
mouseInterfaceConfig.mouseScaleFactor = 1.0;

RT.addInterface( RT.Game, RT.MouseInterface, mouseInterfaceConfig );

RT.Game.prototype.initialize = function() {

	@todo make optional: physicsworld	
	var wc = new RT.PhysicsWorld.Config();
	wc.debugDrawAlpha = 0.5; 
	wc.debugDrawThickness = 1.0; 
	this.m_world = new RT.PhysicsWorld( wc );
	this.m_world.initialize();

	var bc = new RT.PhysicsBody.Config();

	bc.position.x = 200;
	bc.position.y = 200;
	bc.size.w = 100;
	bc.size.h = 100;
	bc.dynamic = true;

	body = new RT.PhysicsBody( bc );
	body.initialize();
	this.m_world.addPhysicsBody( body );

	bc.position.x = 400;
	bc.position.y = 350;
	bc.size.w = 800;
	bc.size.h = 20;
	bc.dynamic = false;
	
	body = new RT.PhysicsBody( bc );
	body.initialize();
	this.m_world.addPhysicsBody( body );

	bc.position.x = 600;
	bc.position.y = 150;
	bc.size.w = 200;
	bc.size.h = 20;
	bc.dynamic = false;
	
	body = new RT.PhysicsBody( bc );
	body.initialize();
	this.m_world.addPhysicsBody( body );


	this.mouseEnable();
	this.update();

}

RT.Game.prototype.update = function( cnt ) {

    if( this.m_mouseDown && ( ! this.m_mouseJoint ) ){
		var body = this.getBodyAtMouse();
		if( body ){
			body.SetAwake( true );

			var mjd = new Box2D.Dynamics.Joints.b2MouseJointDef();
			mjd.bodyA = this.m_world.m_world.GetGroundBody();
			mjd.bodyB = body;
			mjd.target.Set( this.m_mouseNow.x, this.m_mouseNow.y );
			mjd.collideConnected = true;
			mjd.maxForce = 300.0 * body.GetMass();
			this.m_mouseJoint = this.m_world.m_world.CreateJoint( mjd );
		}

    }
    
    if( this.m_mouseJoint ){
		if( this.m_mouseDown ){
			this.m_mouseJoint.SetTarget( this.m_mouseNow );
		} else {
			this.m_world.m_world.DestroyJoint( this.m_mouseJoint );
			this.m_mouseJoint = null;
		}
    }

	this.m_world.m_world.Step( 1.0 / 60.0, 1 );
	this.m_world.m_world.DrawDebugData();
	this.m_world.m_world.ClearForces();
	// step again
	window.requestAnimationFrame( $.proxy( this.update, this ) );
};

RT.Game.prototype.onMouseDown = function() {
//	console.log( "onMouseDown " + this.m_mouseDown );
}

RT.Game.prototype.onMouseUp = function() {
//	console.log( "onMouseUp " + this.m_mouseDown );
}

RT.Game.prototype.onMouseMove = function() {
//	console.log( "onMouseMove " + this.m_mouseNow.toString() );
}


RT.Game.prototype.getBodyAtMouse = function() {
	var aabb = new Box2D.Collision.b2AABB();
	aabb.lowerBound.Set( this.m_mouseNow.x - 0.001, this.m_mouseNow.y - 0.001 );
	aabb.upperBound.Set( this.m_mouseNow.x + 0.001, this.m_mouseNow.y + 0.001 );

	// Query the world for overlapping shapes.
	this.m_selectedBody = null;
	this.m_world.m_world.QueryAABB( this.queryAABBCallback.bind( this ), aabb );
	return( this.m_selectedBody );
}

RT.Game.prototype.queryAABBCallback = function( fixture ){
	if( fixture.GetBody().GetType() != Box2D.Dynamics.b2Body.b2_staticBody) {
		if( fixture.GetShape().TestPoint( fixture.GetBody().GetTransform(), this.m_mouseNow ) ){
			this.m_selectedBody = fixture.GetBody();
			return( false );
		}
	}
	return( true );
}
 */