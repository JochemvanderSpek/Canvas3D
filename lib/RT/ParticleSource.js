"use strict";

RT.ParticleSource = function(){
	this.createEventDispatcherInterface();

	this.m_position = new RT.Vec2();
	this.m_sourceOffset = new RT.Vec2();
	this.m_direction = new RT.Vec2();
	this.m_speed = 1.0;
	this.m_rate = 0.1;
	this.m_spread = 0.0; // angle in radians
	this.m_lifetime = 100; // TODO make time based

	this.m_image = undefined;
	this.m_imageAngle = 0.0;
	this.m_imageOffset = new RT.Vec2( 0, 0 );
	this.m_imageScaling = new RT.Vec2( 1, 1 );
	this.m_imageAlpha = 1.0;

}

RT.addInterface( RT.ParticleSource, RT.EventDispatcherInterface );

RT.ParticleSource.prototype.initialize = function() {
	this.initializeEventDispatcherInterface();

	this.m_particles = new Array();
}

RT.ParticleSource.prototype.toJSON = function(){
	var object = {};
	object.position = this.m_position.clone();
	return( object );
}

RT.ParticleSource.prototype.fromJSON = function( object ){
	if( object.position !== undefined ){ 
		this.m_position = RT.clone( object.position );
	}
	this.initialize();
	this.dispatchEvent( new RT.Event( 'changed', this, undefined ) );
}

RT.ParticleSource.prototype.setPosition = function( p ){
	this.m_position.set( p );
}

RT.ParticleSource.prototype.getPosition = function(){
	return( this.m_position );
}

RT.ParticleSource.prototype.setDirection = function( p ){
	this.m_direction.set( p );
}

RT.ParticleSource.prototype.getDirection = function(){
	return( this.m_direction );
}

RT.ParticleSource.prototype.setSourceOffset = function( o ){
	this.m_sourceOffset.set( o );
}

RT.ParticleSource.prototype.getSourceOffset = function(){
	return( this.m_sourceOffset );
}

RT.ParticleSource.prototype.setRate = function( r ){
	this.m_rate = r;
}

RT.ParticleSource.prototype.getRate = function(){
	return( this.m_rate );
}

RT.ParticleSource.prototype.setSpeed = function( s ){
	this.m_speed = s;
}

RT.ParticleSource.prototype.getSpeed = function(){
	return( this.m_speed );
}

RT.ParticleSource.prototype.setLifetime = function( l ){
	this.m_lifetime = l;
}

RT.ParticleSource.prototype.getLifetime = function(){
	return( this.m_lifetime );
}

RT.ParticleSource.prototype.setSpread = function( s ){
	this.m_spread = s;
}

RT.ParticleSource.prototype.getSpread = function(){
	return( this.m_spread );
}

RT.ParticleSource.prototype.setImage = function( i ){
	this.m_image = i;
}

RT.ParticleSource.prototype.getImage = function(){
	return( this.m_image );
}

RT.ParticleSource.prototype.setImageAngle = function( a ){
	this.m_imageAngle = a;
}

RT.ParticleSource.prototype.getImageAngle = function(){
	return( this.m_imageAngle );
}

RT.ParticleSource.prototype.setImageAlpha = function( a ){
	this.m_imageAlpha = a;
}

RT.ParticleSource.prototype.getImageAlpha = function(){
	return( this.m_imageAlpha );
}

RT.ParticleSource.prototype.setImageOffset = function( p ){
	this.m_imageOffset.set( p );
}

RT.ParticleSource.prototype.getImageOffset = function(){
	return( this.m_imageOffset );
}

RT.ParticleSource.prototype.setImageScaling = function( p ){
	this.m_imageScaling.set( p );
}

RT.ParticleSource.prototype.getImageScaling = function(){
	return( this.m_imageScaling );
}

RT.ParticleSource.prototype.removeAllParticles = function(){
	this.m_particles.length = 0;
}

RT.ParticleSource.prototype.update = function(){

	var newP = Math.random() * this.m_rate;
	for( var i = 0; i < newP; i++ ){
		var pPos = this.m_position.clone();
		pPos.inc( this.m_sourceOffset );
		var pDir = this.m_direction.clone();
		pDir.rotate( ( Math.random() - 0.5 ) * this.m_spread );
		var pSpeed = this.m_speed;
		pPos.x += Math.random() * pDir.x * pSpeed;
		pPos.y += Math.random() * pDir.y * pSpeed;
		var pLifeTime = 1 + Math.floor( Math.random() * this.m_lifetime );

		// create the ParticleSource member as a Verlet2
		this.m_particles.push( { 'p':pPos, 'd':pDir, 's':pSpeed, 'l':pLifeTime, 'a':pDir.angle() } );
	}

	for( var i = 0; i < this.m_particles.length; i++ ){
		var p = this.m_particles[ i ];
		p.p.x += p.d.x * p.s;
		p.p.y += p.d.y * p.s;
		p.p.y -= 0.5;
		p.l--;
		if( ! p.l ){
			this.m_particles[ i ] = this.m_particles[ this.m_particles.length - 1 ];
			this.m_particles.length--;
		}
	}
}

RT.ParticleSource.prototype.draw = function( context, options ){
	for( var i = 0; i < this.m_particles.length; i++ ){
		var p = this.m_particles[ i ];

		if( ! this.m_image ){
			context.beginPath();
			context.moveTo( p.p.x + 4, p.p.y );
			context.arc( p.p.x, p.p.y, 4, 0, Math.TAU );
			context.closePath();
			context.fillStyle = 'rgba( 255, 0, 0 )';
			context.fill();
		}
		else{
			context.save();
			if( this.m_imageAlpha < 1.0 ){
				context.globalAlpha = this.m_imageAlpha;
			}
			context.translate( p.p.x, p.p.y ); 
			context.rotate( p.a + this.m_imageAngle );
			context.scale( this.m_imageScaling.x, this.m_imageScaling.y );
			context.drawImage( this.m_image[ 0 ], this.m_imageOffset.x, this.m_imageOffset.y );
			context.restore();
		}
	}
}

RT.ParticleSource.prototype.destroy = function(){
	this.dispatchEvent( new RT.Event( 'destroy', this, undefined ) );
  	this.destroyEventDispatcherInterface();
}
