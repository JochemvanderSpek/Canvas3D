"use strict";


RT.Cell = function( space, column, row ){
	this.m_cellSpace = space;
	this.m_column = column;
	this.m_row = row;
	this.m_blocked = false;
	this.m_objects = new Array();
	this.m_cellType = 0;

	var p = this.m_cellSpace.getCellCoords( this.m_column, this.m_row );
	var size = this.m_cellSpace.getCellSize();
	this.m_naabb = { 'left':( p.x - size.x / 2.0 ), 'right':( p.x + size.x / 2.0 ), 'bottom':( p.y + size.y / 2.0 ), 'top':( p.y - size.y / 2.0 ), 'x':p.x, 'y':p.y };

	return( this );
}

RT.Cell.FREE	 			= 0;
RT.Cell.LEFT_WALL 			= 1;
RT.Cell.RIGHT_WALL 			= 2;
RT.Cell.CEILING 			= 4;
RT.Cell.FLOOR 				= 8;
RT.Cell.ENCLOSED			= 16;
RT.Cell.LOWER_LEFT_LEDGE 	= 32;
RT.Cell.UPPER_LEFT_LEDGE 	= 64;
RT.Cell.LOWER_RIGHT_LEDGE 	= 128;
RT.Cell.UPPER_RIGHT_LEDGE 	= 256;
RT.Cell.WALL	 			= RT.Cell.LEFT_WALL | RT.Cell.RIGHT_WALL;

RT.Cell.prototype.setCellType = function( type ) {
	this.m_cellType = type;
}

RT.Cell.prototype.getCellType = function( ) {
	return( this.m_cellType );
}

RT.Cell.prototype.getRow = function( ) {
	return( this.m_row );
}

RT.Cell.prototype.getColumn = function( ) {
	return( this.m_column );
}

RT.Cell.prototype.getCellCoords = function( ) {
	return( this.m_cellSpace.getCellCoords( this.m_column, this.m_row ) );
}

RT.Cell.prototype.getNeighbour = function( nx, ny ) {
	if( ny === undefined && nx.x !== undefined && nx.y !== undefined ){
		return( this.m_cellSpace.getCell( this.m_column + nx.x, this.m_row + nx.y ) );
	}
	else{
		return( this.m_cellSpace.getCell( this.m_column + nx, this.m_row + ny ) );
	}
}

RT.Cell.prototype.getCellSpace = function( ) {
	return( this.m_cellSpace );
}

RT.Cell.prototype.getNeighbourCellType = function( dx, dy ) {
	var p = this.m_cellSpace.getCellCoords( this.m_column, this.m_row );
	var size = this.m_cellSpace.getCellSize();
	p.x += dx * size.x;
	p.y += dy * size.y;
	var cells = this.m_cellSpace.getCells( p );
	if( cells && cells.length ){
		return( cells[ 0 ].getCellType() );
	}
	else{
		return( false );
	}
}

RT.Cell.prototype.isNeighbourCellType = function( dx, dy, type ) {
	var p = this.m_cellSpace.getCellCoords( this.m_column, this.m_row );
	var size = this.m_cellSpace.getCellSize();
	p.x += dx * size.x;
	p.y += dy * size.y;
	var cells = this.m_cellSpace.getCells( p );
	if( cells && cells.length ){
		return( cells[ 0 ].getCellType() & type );
	}
	else{
		return( false );
	}
}

RT.Cell.prototype.getNAABB = function( ) {
	return( this.m_naabb );
}

RT.Cell.prototype.addObject = function( object ) {
	if( this.m_objects.indexOf( object ) < 0 ){
		this.m_objects.push( object );
	}
	else{
		// TODO event ?
	}
}

RT.Cell.prototype.removeObject = function( object ) {
	var index = this.m_objects.indexOf( object ); 
	if( index >= 0 ){
		this.m_objects.splice( index, 1 );
	}
	else{
		// TODO event not found
	}
}

RT.Cell.prototype.getObjects = function() {
	return( this.m_objects );
}

RT.Cell.prototype.setBlocked = function( state ) {
	this.m_blocked = state;
}

RT.Cell.prototype.getBlocked = function() {
	return( this.m_blocked );
}

RT.Cell.prototype.draw = function( context, options ) {
	var p = this.m_cellSpace.getCellCoords( this.m_column, this.m_row );
	var size = this.m_cellSpace.getCellSize();

	if( options.text ){
		context.font = "30px Arial";
		context.fillStyle = "#000000";
		var text = this.m_objects.length.toFixed( 0 );
		var metrics = context.measureText( text );
		context.fillText( text, p.x - metrics.width / 2.0, p.y + 15.0 );// 15.0 is given from font height
	}

	if( options.background ){
		if( options.backgroundColor ){
			var color = options.backgroundColor;
		}
		else{
			var alpha = Math.min( 155 + ( this.m_objects.length / 10 ) * 10, 255 ) / 255.0;
			// alpha is scalar [0,1]!
			var color = 'rgba( 128, 128, 128, ' + alpha + ' );';
			if( this.m_blocked ){
				color = 'rgba( 50, 50, 50, 0.9 );';
			}
		}
		context.fillStyle = color;
		context.fillRect( p.x - size.x / 2.0, p.y - size.y / 2.0, size.x, size.y );
	}
	else if( this.m_blocked ){
		if( options.blockedColor ){
			var color = options.blockedColor;
		}
		else{
			var color = 'rgba( 0, 0, 0, 1.0 )';
		}
		context.fillStyle = color;
		context.fillRect( p.x - size.x / 2.0, p.y - size.y / 2.0, size.x, size.y );
	}

	if( this.m_cellType && options.CellType ){
		context.save();
		context.strokeStyle = options.CellType.strokeStyle;
		context.lineWidth = options.CellType.lineWidth;
		context.beginPath();
		if( this.m_cellType & RT.Cell.LEFT_WALL ){
			context.moveTo( this.m_naabb.left, this.m_naabb.top );
			context.lineTo( this.m_naabb.left, this.m_naabb.bottom );

			context.moveTo( this.m_naabb.x - 5, this.m_naabb.y );
			context.lineTo( this.m_naabb.left, this.m_naabb.y );
		}
		if( this.m_cellType & RT.Cell.RIGHT_WALL ){
			context.moveTo( this.m_naabb.right, this.m_naabb.top );
			context.lineTo( this.m_naabb.right, this.m_naabb.bottom );

			context.moveTo( this.m_naabb.x + 5, this.m_naabb.y );
			context.lineTo( this.m_naabb.right, this.m_naabb.y );
		}
		if( this.m_cellType & RT.Cell.CEILING ){
			context.moveTo( this.m_naabb.left, this.m_naabb.bottom );
			context.lineTo( this.m_naabb.right, this.m_naabb.bottom );

			context.moveTo( this.m_naabb.x, this.m_naabb.y + 5 );
			context.lineTo( this.m_naabb.x, this.m_naabb.bottom );
		}
		if( this.m_cellType & RT.Cell.FLOOR ){
			context.moveTo( this.m_naabb.left, this.m_naabb.top );
			context.lineTo( this.m_naabb.right, this.m_naabb.top );

			context.moveTo( this.m_naabb.x, this.m_naabb.y - 5 );
			context.lineTo( this.m_naabb.x, this.m_naabb.top );
		}
		if( this.m_cellType & RT.Cell.ENCLOSED ){
			context.moveTo( this.m_naabb.x + 5.0, this.m_naabb.y );
			context.arc( this.m_naabb.x, this.m_naabb.y, 5.0, 0, Math.TAU );
		}
		if( this.m_cellType & RT.Cell.LOWER_RIGHT_LEDGE ){
			context.moveTo( this.m_naabb.right, this.m_naabb.bottom );
			context.lineTo( this.m_naabb.x, this.m_naabb.y );
		}
		if( this.m_cellType & RT.Cell.LOWER_LEFT_LEDGE ){
			context.moveTo( this.m_naabb.left, this.m_naabb.bottom );
			context.lineTo( this.m_naabb.x, this.m_naabb.y );
		}
		if( this.m_cellType & RT.Cell.UPPER_RIGHT_LEDGE ){
			context.moveTo( this.m_naabb.right, this.m_naabb.top );
			context.lineTo( this.m_naabb.x, this.m_naabb.y );
		}
		if( this.m_cellType & RT.Cell.UPPER_LEFT_LEDGE ){
			context.moveTo( this.m_naabb.left, this.m_naabb.top );
			context.lineTo( this.m_naabb.x, this.m_naabb.y );
		}
		context.stroke();
		context.restore();
	}
}

