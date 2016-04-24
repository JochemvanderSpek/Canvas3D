"use strict";

RT.VertexLayout = function( ){

	this.m_isNormalized = false;
	this.m_numAttributes = 0;
	this.m_totalSize = 0;
	this.m_offsets = new Array();
	this.m_sizes = new Array();
	this.m_names = new Array();
	this.m_lock = false;
}

RT.VertexLayout.positionName = 'position';
RT.VertexLayout.normalName = 'normal';
RT.VertexLayout.texcoordName = 'texcoord';
RT.VertexLayout.colorName = 'color';

RT.VertexLayout.prototype.setLock = function( state ){
	this.m_lock = state;
}

RT.VertexLayout.prototype.getLock = function() {
	return( this.m_lock );
}

RT.VertexLayout.prototype.initialize = function(){
}

RT.VertexLayout.prototype.clear = function(){
	if( this.m_lock ){
		RT.error( 'VertexLayout::clear layout is locked' );
	}
	this.m_numAttributes = 0;
	this.m_totalSize = 0;
	this.m_offsets = new Array();
	this.m_sizes = new Array();
	this.m_names = new Array();
}

/// @brief adds (and not sets) a new attribute to the layout
RT.VertexLayout.prototype.addAttribute = function( numFloats, name ){
	if( this.m_lock ){
		RT.error( 'VertexLayout::addAttribute layout is locked' );
	}
	/// increase the number of attributes
	this.m_numAttributes++;
	/// add the data-offset of this attribute
	this.m_offsets.push( this.m_totalSize );
	
	/// add 1 block of numFloats
	this.m_sizes.push( numFloats );
	/// push the name of the attribute 
	this.m_names.push( name );
	/// increase total size
	this.m_totalSize += numFloats;
}

/// @brief removes an existing attribute from the layout
RT.VertexLayout.prototype.removeAttribute = function( name ){
	if( this.m_lock ){
		RT.error( 'VertexLayout::addAttribute layout is locked' );
	}
	for( var i = 0; i < this.m_numAttributes; i++ ){
		if( this.m_names[ i ] == name ){
			/// decrease total size
			this.m_totalSize -= this.m_sizes[ i ];
			/// decrease the number of attributes
			this.m_numAttributes--;
			// erase the attribute parameters
			this.m_offsets.splice( i, 1 );
			this.m_sizes.erase( i, 1 );
			this.m_names.erase( i, 1 );
			return;	
		}
	}
}

RT.VertexLayout.prototype.getNumAttributes = function(){
	return( this.m_numAttributes );
}

RT.VertexLayout.prototype.getTotalSize = function(){
	return( this.m_totalSize );
}

RT.VertexLayout.prototype.getAttributeOffsets = function(){
	return( this.m_offsets );
}

RT.VertexLayout.prototype.getAttributeSizes = function(){
	return( this.m_sizes );
}

RT.VertexLayout.prototype.getAttributeNames = function(){
	return( this.m_names );
}

RT.VertexLayout.prototype.getAttributeSize = function( name ) {
	for( var i = 0; i < this.m_names.size(); i++ ){
		if( this.m_names[ i ] == name ){
			return( this.m_sizes[ i ] );
		}
	}
	RT.error( 'VertexLayout::getAttributeSize item not in group' );
	return( 0 );
}

RT.VertexLayout.prototype.getAttributeOffset = function(  name ) {
	for( var i = 0; i < this.m_names.size(); i++ ){
		if( this.m_names[ i ] == name ){
			return( this.m_offsets[ i ] );
		}
	}
	RT.error( 'VertexLayout::getAttributeOffset item not in group' );
	return( 0 );
}

RT.VertexLayout.prototype.getAttributeSizeAndOffset = function( name ) {
	for( var i = 0; i < this.m_names.size(); i++ ){
		if( this.m_names[ i ] == name ){
			size = this.m_sizes[ i ];
			offset = this.m_offsets[ i ];
			return( { 'size':size, 'offset':offset } );
		}
	}
	RT.error( 'VertexLayout::getAttributeSizeAndOffset item not in group' );
	return( undefined );
}

RT.VertexLayout.prototype.hasAttribute = function(  name ){
	for( var i = 0; i < this.m_names.size(); i++ ){
		if( this.m_names[ i ] == name ){
			return( true );
		}
	}
	return( false );
}

