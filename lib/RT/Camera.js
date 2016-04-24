"use strict";

// Ok, here we go: the AbstractCamera serves as a base with a modelview- and a projection
// matrix. Subclasses can re-implement the calculateModelviewMatrix function to construct                                                                                                    
// the proper matrix for that camera. The projectionmatrix is handled by the AbstractCamera                                                                                                       
// and normally does not need to be re-implemented, but is virtual nonetheless. 
// The subclasses can also re-implement the translate- and rotate functions as needed.                   
//                                                                                                        
// The default AbstractCamera with an identity modelview conforms to the OpenGL default 
// of a y-up camera looking down the negative z-axis
//                                                                                                        
//                     UP(+Y) ^    /FRONT(-Z)                                                                   
//                            |   /                                                                     
//                         /+-|----+                                                                     
//                        +------+/|                                                                             
//       (-X)LEFT  <------|   O  |-----> RIGHT(+X)                                                              
//                        +-/----+/                                                                           
//                         /  |                                                                           
//                        /   |                                                                           
//                  BACK(+Z) DOWN(-Y)                                                                           
//                                                                                                        

RT.Camera = function(){

	this.m_longitude = 0.0;
	this.m_latitude = 0.0;
	this.m_roll = 0.0;
	this.m_distance = 20.0;
	this.m_center = vec3.create( [ 0.0, 0.0, 0.0 ] );

	this.m_modelViewMatrix = mat4.create();
	this.m_projectionMatrix = mat4.create();

	mat4.identity( this.m_modelViewMatrix );
	mat4.identity( this.m_projectionMatrix );

	this.m_orthogonal = false;
	this.m_width = 0.0;
	this.m_height = 0.0;
	this.m_nearPlane = 1.0;
	this.m_farPlane = 100.0;
	this.m_horizontalFlip = false;
	this.m_verticalFlip = false;
	this.m_zoom = 1.0;
	this.m_yUp = true;
}

RT.Camera.prototype.calculateModelViewMatrix = function(){
    mat4.identity( this.m_modelViewMatrix );

	mat4.translate( this.m_modelViewMatrix, vec3.create( [ 0.0, 0.0, -this.m_distance ] ) );

	mat4.rotate( this.m_modelViewMatrix, -this.m_roll, vec3.create( [ 0.0, 0.0, 1.0 ] ) );
	mat4.rotate( this.m_modelViewMatrix, -this.m_latitude, vec3.create( [ 1.0, 0.0, 0.0 ] ) );
	mat4.rotate( this.m_modelViewMatrix, -this.m_longitude, vec3.create( [ 0.0, 1.0, 0.0 ] ) );

	if( ! this.m_yUp ){
		mat4.rotate( this.m_modelViewMatrix, -90.0, vec3.create( [ 1.0, 0.0, 0.0 ] ) ); 
	}

	mat4.translate( this.m_modelViewMatrix, vec3.negate( this.m_center ) );
}

RT.Camera.prototype.calculateProjectionMatrix = function(){
	/** aligns the this.m_modelViewMatrix and this.m_projectionMatrix matrix to match OpenGL:
	    +--------------------+        +\                                          
	    |                    |        |  \                       
	    |         ^ +y       |        |    \                     
	    |         |          |        |      \                   
	    |         |          |        |        \                  
	    |         |          |        |          \ 
        |         o-----> +x |        o----> +z   > eye
	    |        center      |        |          /           
	    |                    |        |        /             
	    |                    |        |      /               
	    |                    |        |    /                      
	    |                    |        |  /                        
	    +--------------------+        +/                     
	*/
    mat4.identity( this.m_projectionMatrix );

	// flip (horizontally invert)
	if( this.m_horizontalFlip ){
		this.m_projectionMatrix[ 0 ] = -1.0;
	}

	// or flop (vertically invert)
	if( this.m_verticalFlip ){
		this.m_projectionMatrix[ 5 ] = -1.0;
	}

	if( this.m_orthogonal ){
		mat4.multiply( this.m_projectionMatrix, mat4.ortho( -this.m_width * 0.5 * this.m_zoom, this.m_width * 0.5 * this.m_zoom, -this.m_height * 0.5 * this.m_zoom, this.m_height * 0.5 * this.m_zoom, this.m_nearPlane, this.m_farPlane, this.m_projectionMatrix ) );
	}
	else {
		mat4.multiply( this.m_projectionMatrix, mat4.frustum( -this.m_width * 0.5 * this.m_zoom, this.m_width * 0.5 * this.m_zoom, -this.m_height * 0.5 * this.m_zoom, this.m_height * 0.5 * this.m_zoom, this.m_nearPlane, this.m_farPlane, this.m_projectionMatrix ) );
	}
}

RT.Camera.prototype.setLongitude = function( longitude ){
	this.m_longitude = longitude;
}

RT.Camera.prototype.getLongitude = function(){
	return( this.m_longitude );
}

RT.Camera.prototype.setLatitude = function( latitude ){
	this.m_latitude = latitude;
}

RT.Camera.prototype.getLatitude = function(){
	return( this.m_latitude );
}

RT.Camera.prototype.setRoll = function( roll ){
	this.m_roll = roll;
}

RT.Camera.prototype.getRoll = function(){
	return( this.m_roll );
}

RT.Camera.prototype.setCenter = function( v ){
	this.m_center[ 0 ] = v[ 0 ];
	this.m_center[ 1 ] = v[ 1 ];
	this.m_center[ 2 ] = v[ 2 ];
}

RT.Camera.prototype.getCenter = function(){
	return( this.m_center );
}

RT.Camera.prototype.setDistance = function( distance ){
	this.m_distance = distance;
}

RT.Camera.prototype.getDistance = function(){
	return( this.m_distance );
}

RT.Camera.prototype.getOrthogonal = function() {
	return( this.m_orthogonal );
}

RT.Camera.prototype.setOrthogonal = function( state ){ 
	this.m_orthogonal = state;
}

RT.Camera.prototype.setNearPlane = function( s ){ 
	this.m_nearPlane = s;
}

RT.Camera.prototype.getNearPlane = function(){
	return( this.m_nearPlane );
}

RT.Camera.prototype.setFarPlane = function( s ){ 
	this.m_farPlane = s;
}

RT.Camera.prototype.getFarPlane = function(){
	return( this.m_farPlane );
}

RT.Camera.prototype.setHorizontalFlip = function( state ){ 
	this.m_horizontalFlip = state;
}

RT.Camera.prototype.getHorizontalFlip = function(){
	return( this.m_horizontalFlip );
}

RT.Camera.prototype.setVerticalFlip = function( state ){ 
	this.m_verticalFlip = state;
}

RT.Camera.prototype.getVerticalFlip = function(){
	return( this.m_verticalFlip );
}

RT.Camera.prototype.setZoom = function( value ){ 
	this.m_zoom = value; 
}

RT.Camera.prototype.getZoom = function(){
	return( this.m_zoom );
}

RT.Camera.prototype.calculateWidthHeightFromVerticalFOV = function( fov, aspectRatio ){ 
	//  sideview                                     
	//     /|                                 
	//   /  |                                
	// < a  | height              tan a = ( height / 2.0 ) / near                     
	//   \  |                                
	//     \|                                
	// |<-->|                                 
	//  near
	//
	this.m_height = 2.0 * Math.tan( RT.toRadians( fov / 2.0 ) ) * this.m_nearPlane;
	// preserve the aspect ratio
	this.m_width = this.m_height * aspectRatio;
}

RT.Camera.prototype.getFOV = function(){
	// return the vertical field of view (the inverse of calculateWidthHeightFromVerticalFOV)
	return( 2.0 * RT.toDegrees( Math.atan( ( this.m_height * 0.5 ) / this.m_nearPlane ) ) );
}

RT.Camera.prototype.getAspectRatio = function(){
	return( this.m_width / this.m_height );
}

RT.Camera.prototype.setWidth = function( x ){ 
	this.m_width = x;
}

RT.Camera.prototype.getWidth = function(){
	return( this.m_width );
}

RT.Camera.prototype.setHeight = function( x ){ 
	this.m_height = x;
}

RT.Camera.prototype.getHeight = function(){
	return( this.m_height );
}

RT.Camera.prototype.setYUp = function( state ){ 
	this.m_yUp = state;
}

RT.Camera.prototype.getYUp = function(){
	return( this.m_yUp );
}

RT.Camera.prototype.toTHREE = function( THREECamera ){
	this.calculateProjectionMatrix();
	this.calculateModelViewMatrix();
	THREECamera.matrixWorld.elements = this.m_modelViewMatrix;
	mat4.inverse( this.m_modelViewMatrix, THREECamera.matrixWorldInverse.elements );
	THREECamera.projectionMatrix.elements = this.m_projectionMatrix;
	THREECamera.matrixAutoUpdate = false;
	THREECamera.matrixWorldNeedsUpdate = false;

}

