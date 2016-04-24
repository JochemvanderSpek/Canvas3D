"use strict";

RT.Program = function( glContext ){
	this.m_glContext = glContext;

	this.m_vertexShader = undefined;
	this.m_fragmentShader = undefined;
	this.m_vertexShaderSource = undefined;
	this.m_fragmentShaderSource = undefined;
	this.m_shaderProgram = undefined;
}

RT.Program.current = undefined;

RT.Program.prototype.initialize = function(){
	this.m_fragmentShader = this.m_glContext.createShader( this.m_glContext.FRAGMENT_SHADER );
	if( ! this.m_fragmentShader ){
		RT.error( 'Program::initialize couldn\'t create fragment shader' );
		return undefined;
	}
	this.m_glContext.shaderSource( this.m_fragmentShader, this.m_fragmentShaderSource );
	this.m_glContext.compileShader( this.m_fragmentShader );

	if( ! this.m_glContext.getShaderParameter( this.m_fragmentShader, this.m_glContext.COMPILE_STATUS ) ){
		RT.error( 'Program::initialize couldn\'t compile program due to fragment shader' + this.m_glContext.getShaderInfoLog( this.m_fragmentShader ) );
		return undefined;
	}

	this.m_vertexShader = this.m_glContext.createShader( this.m_glContext.VERTEX_SHADER );
	if( ! this.m_vertexShader ){
		RT.error( 'Program::initialize couldn\'t create vertex shader' );
		return undefined;
	}
	this.m_glContext.shaderSource( this.m_vertexShader, this.m_vertexShaderSource );
	this.m_glContext.compileShader( this.m_vertexShader );

	if( ! this.m_glContext.getShaderParameter( this.m_vertexShader, this.m_glContext.COMPILE_STATUS ) ){
		RT.error( 'Program::initialize couldn\'t compile program due to vertex shader' + this.m_glContext.getShaderInfoLog( this.m_vertexShader ) );
		return undefined;
	}

   	this.m_shaderProgram = this.m_glContext.createProgram();
    this.m_glContext.attachShader( this.m_shaderProgram, this.m_vertexShader );
    this.m_glContext.attachShader( this.m_shaderProgram, this.m_fragmentShader );
    this.m_glContext.linkProgram( this.m_shaderProgram );

    if( ! this.m_glContext.getProgramParameter( this.m_shaderProgram, this.m_glContext.LINK_STATUS ) ){
		RT.error( 'Program::initialize couldn\'t link program' );
		return undefined;
    }
    this.m_initialized = true;
}

RT.Program.prototype.getShaderProgram = function(){
	return( this.m_shaderProgram );
}

RT.Program.prototype.bind = function(){
	if( this.m_initialized ){
		RT.Program.current = this;
	    this.m_glContext.useProgram( this.m_shaderProgram );
	}
}

RT.Program.prototype.unbind = function(){
	if( this.m_initialized ){
		RT.Program.current = undefined;
	    this.m_glContext.useProgram( 0 );
	}
}

RT.Program.prototype.setVertexShaderSource = function( code ){
	this.m_vertexShaderSource = code;
}

RT.Program.prototype.setFragmentShaderSource = function( code ){
	this.m_fragmentShaderSource = code;
}

RT.Program.prototype.bindUniform1f = function( name, value ){
	var location = this.m_glContext.getUniformLocation( this.m_shaderProgram, name );
	this.m_glContext.uniform1f( location, value );
}

RT.Program.prototype.bindUniform2f = function( name, value ){
	var location = this.m_glContext.getUniformLocation( this.m_shaderProgram, name );
	this.m_glContext.uniform2f( location, value );
}

RT.Program.prototype.bindUniform3f = function( name, value ){
	var location = this.m_glContext.getUniformLocation( this.m_shaderProgram, name );
	this.m_glContext.uniform3f( location, value );
}

RT.Program.prototype.bindUniform4f = function( name, value ){
	var location = this.m_glContext.getUniformLocation( this.m_shaderProgram, name );
	this.m_glContext.uniform4f( location, value );
}
RT.Program.prototype.bindUniform1fv = function( name, value ){
	var location = this.m_glContext.getUniformLocation( this.m_shaderProgram, name );
	this.m_glContext.uniform1fv( location, value );
}

RT.Program.prototype.bindUniform2fv = function( name, value ){
	var location = this.m_glContext.getUniformLocation( this.m_shaderProgram, name );
	this.m_glContext.uniform2fv( location, value );
}

RT.Program.prototype.bindUniform3fv = function( name, value ){
	var location = this.m_glContext.getUniformLocation( this.m_shaderProgram, name );
	this.m_glContext.uniform3fv( location, value );
}

RT.Program.prototype.bindUniform4fv = function( name, value ){
	var location = this.m_glContext.getUniformLocation( this.m_shaderProgram, name );
	this.m_glContext.uniform4fv( location, value );
}

RT.Program.prototype.bindUniform1i = function( name, value ){
	var location = this.m_glContext.getUniformLocation( this.m_shaderProgram, name );
	this.m_glContext.uniform1i( location, value );
}

RT.Program.prototype.bindUniform2i = function( name, value ){
	var location = this.m_glContext.getUniformLocation( this.m_shaderProgram, name );
	this.m_glContext.uniform2i( location, value );
}

RT.Program.prototype.bindUniform3i = function( name, value ){
	var location = this.m_glContext.getUniformLocation( this.m_shaderProgram, name );
	this.m_glContext.uniform3i( location, value );
}

RT.Program.prototype.bindUniform4i = function( name, value ){
	var location = this.m_glContext.getUniformLocation( this.m_shaderProgram, name );
	this.m_glContext.uniform4i( location, value );
}
RT.Program.prototype.bindUniform1iv = function( name, value ){
	var location = this.m_glContext.getUniformLocation( this.m_shaderProgram, name );
	this.m_glContext.uniform1iv( location, value );
}

RT.Program.prototype.bindUniform2iv = function( name, value ){
	var location = this.m_glContext.getUniformLocation( this.m_shaderProgram, name );
	this.m_glContext.uniform2iv( location, value );
}

RT.Program.prototype.bindUniform3iv = function( name, value ){
	var location = this.m_glContext.getUniformLocation( this.m_shaderProgram, name );
	this.m_glContext.uniform3iv( location, value );
}

RT.Program.prototype.bindUniform4iv = function( name, value ){
	var location = this.m_glContext.getUniformLocation( this.m_shaderProgram, name );
	this.m_glContext.uniform4iv( location, value );
}

RT.Program.prototype.bindUniformMatrix2fv = function( name, transpose, mat ){
	var location = this.m_glContext.getUniformLocation( this.m_shaderProgram, name );
	this.m_glContext.uniformMatrix2fv( location, transpose, mat );
}

RT.Program.prototype.bindUniformMatrix3fv = function( name, transpose, mat ){
	var location = this.m_glContext.getUniformLocation( this.m_shaderProgram, name );
	this.m_glContext.uniformMatrix3fv( location, transpose, mat );
}

RT.Program.prototype.bindUniformMatrix4fv = function( name, transpose, mat ){
	var location = this.m_glContext.getUniformLocation( this.m_shaderProgram, name );
	this.m_glContext.uniformMatrix4fv( location, transpose, mat );
}

RT.Program.prototype.destroy = function(){
	this.m_glContext.detachShader( this.m_shaderProgram, this.m_vertexShader );
	this.m_glContext.detachShader( this.m_shaderProgram, this.m_fragmentShader );

	this.m_glContext.deleteProgram( this.m_shaderProgram );
	this.m_glContext.deleteShader( this.m_vertexShader );
	this.m_glContext.deleteShader( this.m_fragmentShader );
}

