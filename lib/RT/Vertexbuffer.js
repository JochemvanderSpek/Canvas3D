"use strict";

RT.Vertexbuffer = function( glContext, vertexLayout ){

	this.m_glContext = glContext;
	this.m_vertexLayout = vertexLayout;

	this.m_buffer = undefined;
	this.m_indexBuffer = undefined;

	this.m_keepSourceData = false;
	this.m_keepSourceIndexData = true;
	this.m_usage = undefined;
	this.m_indexUsage = undefined;
	this.m_mode = undefined;
	this.m_numVertices = 0;
	this.m_data = 0;
	this.m_indexData = 0;
	this.m_numIndices = 0;
	this.m_dataChanged = false;
	this.m_indexDataChanged = false;
	this.m_warnForNonExistentAttributes = false;
	this.m_useIndexbuffer = false;
}

RT.Vertexbuffer.prototype.fromJSON = function( object ){
	this.m_keepSourceData = object.keepSourceData;
	this.m_keepSourceIndexData = object.keepSourceIndexData;
	this.m_usage = object.usage;
	this.m_indexUsage = object.indexUsage;
	this.m_mode = object.mode;
	this.m_numVertices = object.numVertices;
	this.m_data = RT.clone( object.data );
	this.m_indexData = RT.clone( object.indexData );
	this.m_numIndices = object.numIndices;
	this.m_dataChanged = object.dataChanged;
	this.m_indexDataChanged = object.indexDataChanged;
	this.m_warnForNonExistentAttributes = object.warnForNonExistentAttributes;
	this.m_useIndexbuffer = object.useIndexbuffer;
}

RT.Vertexbuffer.prototype.toJSON = function(){
	var object = {};

	object.keepSourceData = this.m_keepSourceData;
	object.keepSourceIndexData = this.m_keepSourceIndexData;
	object.usage = this.m_usage;
	object.indexUsage = this.m_indexUsage;
	object.mode = this.m_mode;
	object.numVertices = this.m_numVertices;
	object.data = RT.clone( this.m_data );
	object.indexData = RT.clone( this.m_indexData );
	object.numIndices = this.m_numIndices;
	object.dataChanged = this.m_dataChanged;
	object.indexDataChanged = this.m_indexDataChanged;
	object.warnForNonExistentAttributes = this.m_warnForNonExistentAttributes;
	object.useIndexbuffer = this.m_useIndexbuffer;
}

RT.Vertexbuffer.prototype.initialize = function(){
	if( this.m_glContext ){
		this.m_usage = this.m_glContext.STATIC_DRAW;
		this.m_indexUsage = this.m_glContext.STATIC_DRAW;
		this.m_mode = this.m_glContext.TRIANGLES;

		this.m_buffer = this.m_glContext.createBuffer();
		if( this.m_numVertices ){
			this.m_data = new Float32Array( this.m_numVertices * this.m_vertexLayout.getTotalSize() );
		}

		if( this.m_useIndexbuffer ){
			this.m_indexBuffer = this.m_glContext.createBuffer();
			if( this.m_numIndices ){
				this.m_indexData = new Int16Array( this.m_numIndices );
			}
		}
	}
	this.m_initialized = true;
}

RT.Vertexbuffer.prototype.destroy = function(){
	if( this.m_initialized ){
		this.m_glContext.deleteBuffer( this.m_buffer );
		if( this.m_useIndexbuffer ){
			this.m_glContext.deleteBuffer( this.m_indexBuffer );
		}
	}
}

RT.Vertexbuffer.prototype.getUsage = function( ){ 
	return( this.m_usage ); 
}

RT.Vertexbuffer.prototype.getIndexUsage = function( ){ 
	return( this.m_indexUsage ); 
}

RT.Vertexbuffer.prototype.getMode = function( ){ 
	return( this.m_mode ); 
}

RT.Vertexbuffer.prototype.getNumVertices = function( ){ 
	return( this.m_numVertices ); 
}

RT.Vertexbuffer.prototype.setUsage = function( usage ){ 
	this.m_usage = usage; 
}

RT.Vertexbuffer.prototype.setIndexUsage = function( usage ){ 
	this.m_indexUsage = usage; 
}

RT.Vertexbuffer.prototype.setMode = function( mode ){ 
	this.m_mode = mode; 
}

RT.Vertexbuffer.prototype.getKeepSourceData = function( ){
	return( this.m_keepSourceData );
}

RT.Vertexbuffer.prototype.setKeepSourceData = function( state ){
	this.m_keepSourceData = state;
	if( ! this.m_keepSourceData ){
		this.m_data = new Float32Array();
	}
}

RT.Vertexbuffer.prototype.getKeepSourceIndexData = function( ){
	return( this.m_keepSourceIndexData );
}

RT.Vertexbuffer.prototype.setKeepSourceIndexData = function( state ){
	this.m_keepSourceIndexData = state;
	if( ! this.m_keepSourceIndexData ){
		this.m_indexData = new Int16Array();
	}
}

RT.Vertexbuffer.prototype.getUseIndexbuffer = function( ){
	return( this.m_useIndexbuffer );
}

RT.Vertexbuffer.prototype.setUseIndexbuffer = function( state ){
	this.m_indexDataChanged = ( this.m_useIndexbuffer != state );
	this.m_useIndexbuffer = state;
}

RT.Vertexbuffer.prototype.getData = function( ){ 
	return( this.m_data ); 
}

RT.Vertexbuffer.prototype.getData = function( ){ 
	return( this.m_data ); 
}

RT.Vertexbuffer.prototype.getIndexData = function( ){ 
	return( this.m_indexData ); 
}

RT.Vertexbuffer.prototype.setNumIndices = function( numIndices ){
	if( this.m_useIndexbuffer ){
		this.m_indexDataChanged = ( this.m_numIndices != numIndices );
		this.m_numIndices = numIndices;
		this.m_indexData = new Int16Array( this.m_numIndices );
	}
}

RT.Vertexbuffer.prototype.getNumIndices = function(){
	return( this.m_numIndices );
}

RT.Vertexbuffer.prototype.setData = function( dataFloat32Array ){
	if( this.m_vertexLayout === undefined || this.m_vertexLayout.getTotalSize() == 0 ){
		RT.error( "Vertexbuffer::setData invalid or non-existent VertexLayout" );
	}
	if( dataFloat32Array.length / this.m_vertexLayout.getTotalSize() > this.m_numVertices ){
		RT.error( "Vertexbuffer::setData the offset specified to Vertexbuffer::setData is out of bounds" );
	}
	else if( ! this.m_keepSourceData ){
		if( ! this.m_initialized ){
			// we need the buffer ID's set before we can bind them, so we need to be initialized
			RT.error( "Vertexbuffer::setData vertexbuffer is not initialized - did you call initialize() ?" );
		}
		this.m_glContext.bindBuffer( this.m_glContext.ARRAY_BUFFER, this.m_buffer );
		this.m_glContext.bufferData( this.m_glContext.ARRAY_BUFFER, dataFloat32Array, this.m_usage );
	}
	else{
		for( var i = 0; i < dataFloat32Array.length; i++ ){
			this.m_data[ offset + i ] = dataFloat32Array[ i ];
		}
		this.m_dataChanged = true;
	}
}

RT.Vertexbuffer.prototype.setSubData = function( offset, dataFloat32Array ){
	if( this.m_vertexLayout === undefined || this.m_vertexLayout.getTotalSize() == 0 ){
		RT.error( "Vertexbuffer::setSubData invalid or non-existent VertexLayout" );
	}
	if( offset + dataFloat32Array.length / this.m_vertexLayout.getTotalSize() > this.m_numVertices ){
		RT.error( "Vertexbuffer::setSubData the offset specified to Vertexbuffer::setSubData is out of bounds" );
	}
	else if( ! this.m_keepSourceData ){
		if( ! this.m_initialized ){
			// we need the buffer ID's set before we can bind them, so we need to be initialized
			RT.error( "Vertexbuffer::setSubData vertexbuffer is not initialized - did you call initialize() ?" );
		}
		this.m_glContext.bindBuffer( this.m_glContext.ARRAY_BUFFER, this.m_buffer );
		this.m_glContext.bufferSubData( this.m_glContext.ARRAY_BUFFER, this.m_data.subarray( offset ), dataFloat32Array );
	}
	else{
		for( var i = 0; i < dataFloat32Array.length; i++ ){
			this.m_data[ offset + i ] = dataFloat32Array[ i ];
		}
		this.m_dataChanged = true;
	}
}

RT.Vertexbuffer.prototype.setIndices = function( offset, indicesInt16Array ){
	if( ! this.m_useIndexbuffer ){
		RT.error( "Vertexbuffer::setIndices you need to call Vertexbuffer::setUseIndexbuffer( true ) before Vertexbuffer::setIndices" );
	}
	else if( offset + indicesInt16Array.length > this.m_numIndices ){
		RT.error( "Vertexbuffer::setIndices the offset specified to Vertexbuffer::setIndices is out of bounds" );
	}
	else if( ! this.m_keepSourceIndexData ){
		if( ! this.m_initialized ){
			// we need the buffer ID's set before we can bind them, so we need to be initialized
			RT.error( "Vertexbuffer::setIndices vertexbuffer is not initialized - did you call initialize() ?" );
		}
		this.m_glContext.bindBuffer( this.m_glContext.ELEMENT_ARRAY_BUFFER, this.m_indexBuffer );
		this.m_glContext.bufferSubData( this.m_glContext.ELEMENT_ARRAY_BUFFER, this.m_indexBuffer.subarray( offset ), indicesInt16Array );
	}
	else{
		for( var i = 0; i < indicesInt16Array.length; i++ ){
			this.m_indexData[ offset + i ] = indicesInt16Array[ i ];
		}
		this.m_indexDataChanged = true;
	}
}

RT.Vertexbuffer.prototype.getVertexLayout = function(){
	return( this.m_vertexLayout );
}
	
RT.Vertexbuffer.prototype.setNumVertices = function( numVertices ){
	if( this.m_initialized ){
		if( numVertices != this.m_numVertices ){
			this.m_numVertices = numVertices;
			/// on this resize
			resize();
		}
	}
	else{
		this.m_numVertices = numVertices;
	}
}

RT.Vertexbuffer.prototype.setAttributeData = function( vertexOffset, dataFloat32Array, attrib ){
	if( vertexOffset >= this.m_numVertices || vertexOffset + dataFloat32Array.length > this.m_numVertices ){
		RT.error( "Vertexbuffer::setAttributeData the offset specified to Vertexbuffer::setAttributeData is out of bounds" );
	}
	var attribIndex;
	for( attribIndex = 0; attribIndex < this.m_vertexLayout.m_numAttributes; attribIndex++ ){
		if( this.m_vertexLayout.m_names[ attribIndex ] == attrib ){
			break;
		}
	}
	if( attribIndex >= this.m_vertexLayout.m_numAttributes ){
		RT.error( "Vertexbuffer::setAttributeData trying to set an attribute that doesn't exist in the vertexbuffer" );
	}
	var attribOffset = this.m_vertexLayout.m_offsets[ attribIndex ];
	var attribSize = this.m_vertexLayout.m_sizes[ attribIndex ];
	var totalSize = this.m_vertexLayout.m_totalSize;
	var offset = vertexOffset * totalSize + attribOffset;
	if( this.m_data ){
		for( var i = 0; i < dataFloat32Array.length; i++ ){
			for( var j = 0; j < attribSize; j++ ){
				this.m_data[ offset + i * totalSize + j ] = dataFloat32Array[ i * attribSize + j ];
			}
		}
		/// flag change
		this.m_dataChanged = true;
	}
	else{
		if( ! this.m_initialized ){
			RT.error( "Vertexbuffer::setAttributeData vertexbuffer is not initialized - did you call initialize() ?" );
		}
		// we don't have the local copy, so we need to use this.m_glContext.bufferSubData, this.m_glContext.bufferData
		this.m_glContext.bindBuffer( this.m_glContext.ARRAY_BUFFER, this.m_buffer );
		for( var i = 0; i < dataFloat32Array.length; i++ ){
			this.m_glContext.bufferSubData( this.m_glContext.ARRAY_BUFFER, this.m_data.subarray( offset + i * totalSize ), dataFloat32Array[ i * attribSize ] );
		}
	}
}

RT.Vertexbuffer.prototype.upload = function(){
	if( ! this.m_vertexLayout ){
		RT.error( "Vertexbuffer::upload vertexbuffer doesn't have a vertex layout");
	}
	if( this.m_dataChanged && this.m_data ){
		/// copy all the data to the card
		this.m_glContext.bindBuffer( this.m_glContext.ARRAY_BUFFER, this.m_buffer );
		this.m_glContext.bufferData( this.m_glContext.ARRAY_BUFFER, this.m_data, this.m_usage );
		this.m_dataChanged = false;
	}

	if( this.m_useIndexbuffer && this.m_indexDataChanged && this.m_indexData ){
		this.m_glContext.bindBuffer( this.m_glContext.ELEMENT_ARRAY_BUFFER, this.m_indexBuffer );
		this.m_glContext.bufferData( this.m_glContext.ELEMENT_ARRAY_BUFFER, this.m_indexData, this.m_indexUsage );
		this.m_indexDataChanged = false;
	}

	if( ! this.m_keepSourceData && this.m_data ){
		this.m_data = new Float32Array();
	}

	if( ! this.m_keepSourceIndexData && this.m_indexData ){
		this.m_indexData = new Int16Array();
	}
}

RT.Vertexbuffer.prototype.draw = function(  ){
	if( ! this.m_vertexLayout ){
		RT.error( "Vertexbuffer::draw vertexbuffer doesn't have a vertex layout");
	}

	var current = RT.Program.current;
	if( current ){
		var program = current.getShaderProgram();
		this.m_glContext.bindBuffer( this.m_glContext.ARRAY_BUFFER, this.m_buffer );
		var floatSize = this.m_data.BYTES_PER_ELEMENT;
		for( var i = 0; i < this.m_vertexLayout.m_numAttributes; i++ ){
			var location = this.m_glContext.getAttribLocation( program, this.m_vertexLayout.m_names[ i ] );
			if( location != -1 ){
				this.m_glContext.enableVertexAttribArray( location );
				this.m_glContext.vertexAttribPointer( location, this.m_vertexLayout.m_sizes[ i ], this.m_glContext.FLOAT, this.m_vertexLayout.m_isNormalized, this.m_vertexLayout.m_totalSize * floatSize, this.m_vertexLayout.m_offsets[ i ] * floatSize );
			}
		}

		if( this.m_useIndexbuffer ){
			this.m_glContext.bindBuffer( this.m_glContext.ELEMENT_ARRAY_BUFFER, this.m_indexBuffer );
			this.m_glContext.drawElements( this.m_mode, this.m_numIndices, this.m_glContext.UNSIGNED_SHORT, 0 );
		}
		else{
			this.m_glContext.drawArrays( this.m_mode, 0, this.m_numVertices );
		}
	}
}

