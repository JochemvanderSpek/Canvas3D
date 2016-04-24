"use strict";


// implement the Interface as a function that can be called by RT.addInterface (Utils.js)
RT.CellInterface = function(){

	this.createCellInterface = function( cellSpace ){
		this.hasCellInterface = true;
		this.m_cellSpace = cellSpace;
		this.m_cells = new Array();
		this.m_cellSelectionMask = { 'default':true };
		this.m_cellData = {};
	}

	this.initializeCellInterface = function(){
		if( ! this.getPosition ){
			RT.error( new RT.Error( RT.Error.INCOMPLETE_IMPLEMENTATION, "An object with CellInterface must implement getPosition()" ) );
		}
		if( ! this.getAABB ){
			RT.error( new RT.Error( RT.Error.INCOMPLETE_IMPLEMENTATION, "An object with CellInterface must implement getAABB()" ) );
		}
	}

	this.setCellSelectionMask = function( key, state ) {
		this.m_cellSelectionMask[ key ] = ( state === true );
	}

	this.getCellSelectionMask = function( type ) {
		if( this.m_cellSelectionMask[ type ] ){
			return( this.m_cellSelectionMask[ type ] );
		}
	}

	this.getCells = function(){
		return( this.m_cells );
	}

	this.getCellSpace = function(){
		return( this.m_cellSpace );
	}

	this.getCellData = function( key ){
		if( key === undefined ){
			return( this.m_cellData );
		}
		else{
			return( this.m_cellData[ key ] );
		}
	}

	this.setCellData = function( key, value ){
		this.m_cellData[ key ] = value;
	}

	this.deleteCellData = function( key ){
		delete this.m_cellData[ key ];
	}

	this.removeCells = function(){
		if( this.m_cells && this.m_cells.length ){
			for( var i = 0; i < this.m_cells.length; i++ ){
				this.m_cells[ i ].removeObject( this );
			}
		}
		if( this.m_cells && this.m_cells.length ){
			this.m_cells.splice( 0, this.m_cells.length );
		}
		this.m_cells = new Array();
	}

	this.removeCellSpace = function(){
		this.m_cellSpace = undefined;
	}

	this.destroyCellInterface = function(){
		this.hasCellInterface = false;
		this.removeCells();
		this.removeCellSpace();
		delete this.m_cells;
		this.m_cells = undefined;
		this.m_cellSpace = undefined;
	}

	return( this );
};
