"use strict";


RT.CellSpace = function( dimensions, resolution, offset ){

	if( ! dimensions ){
		dimensions = { 'x':800, 'y':600 };
	}
	if( ! resolution ){
		resolution = { 'x':8, 'y':6 };
	}
	if( ! offset ){
		offset = { 'x':0.0, 'y':0.0 };
	}

	this.m_offset = offset;
	this.m_dimensions = dimensions;
	this.m_resolution = resolution;

	this.m_cellSize = { 'x':( this.m_dimensions.x / this.m_resolution.x ), 'y':( this.m_dimensions.y / this.m_resolution.y ) };

	// we organize the cells column major
	this.m_cells = new Array();
	for( var x = 0; x < this.m_resolution.x; x++ ){
		this.m_cells.push( new Array() );
		for( var y = 0; y < this.m_resolution.y; y++ ){
			this.m_cells[ x ].push( new RT.Cell( this, x, y ) );
		}
	}

	return( this );
}

RT.CellSpace.prototype.initialize = function() {
	return( this );
}

RT.CellSpace.prototype.getResolution = function() {
	return( this.m_resolution );
}

RT.CellSpace.prototype.getDimensions = function() {
	return( this.m_dimensions );
}

RT.CellSpace.prototype.getBounds = function() {
	return( { 'left':this.m_offset.x, 'right':( this.m_dimensions.x + this.m_offset ), 'bottom':( this.m_dimensions.y + this.m_offset.y ), 'top':this.m_offset.x } );
}

// get the cell that overlaps 'location', 
// guarantees to always return an array with at least one cell
RT.CellSpace.prototype.getCells = function( location, aabb ) {
	if( location === undefined && aabb === undefined ){
		var cells = new Array();
		for( var x = 0; x < this.m_resolution.x; x++ ){ 
			for( var y = 0; y < this.m_resolution.y; y++ ){ 
				cells.push( this.m_cells[ x ][ y ] );
			}
		}
		return( cells );
	}
	// TODO aabb
	if( ! aabb ){
		var ix = Math.floor( ( location.x - this.m_offset.x ) / this.m_cellSize.x );
		var iy = Math.floor( ( location.y - this.m_offset.y ) / this.m_cellSize.y );
		if( ix < 0 ){
			ix = 0;
		}
		if( iy < 0 ){
			iy = 0;
		}
		if( ix >= this.m_resolution.x ){
			ix = this.m_resolution.x - 1;
		}
		if( iy >= this.m_resolution.y ){
			iy = this.m_resolution.y - 1;
		}
		return( [ this.m_cells[ ix ][ iy ] ] );
	}
	else{
		var cells = new Array();
		var ix1 = Math.floor( ( location.x - this.m_offset.x + aabb.left ) / this.m_cellSize.x );
		var iy1 = Math.floor( ( location.y - this.m_offset.y + aabb.top ) / this.m_cellSize.y );
		var ix2 = Math.floor( ( location.x - this.m_offset.x + aabb.right ) / this.m_cellSize.x );
		var iy2 = Math.floor( ( location.y - this.m_offset.y + aabb.bottom ) / this.m_cellSize.y );
		if( ix1 < 0 ){
			ix1 = 0;
		}
		if( iy1 < 0 ){
			iy1 = 0;
		}
		if( ix1 >= this.m_resolution.x ){
			ix1 = this.m_resolution.x - 1;
		}
		if( iy1 >= this.m_resolution.y ){
			iy1 = this.m_resolution.y - 1;
		}
		if( ix2 < 0 ){
			ix2 = 0;
		}
		if( iy2 < 0 ){
			iy2 = 0;
		}
		if( ix2 >= this.m_resolution.x ){
			ix2 = this.m_resolution.x - 1;
		}
		if( iy2 >= this.m_resolution.y ){
			iy2 = this.m_resolution.y - 1;
		}
		for( var ix = ix1; ix <= ix2; ix++ ){ 
			for( var iy = iy1; iy <= iy2; iy++ ){ 
				cells.push( this.m_cells[ ix ][ iy ] );
			}
		}
		return( cells );
	}
}

RT.CellSpace.prototype.setCellsBlocked = function( naabb, state ) {
	var cells = new Array();
	var ix1 = Math.floor( ( naabb.left - this.m_offset.x ) / this.m_cellSize.x );
	var iy1 = Math.floor( ( naabb.top - this.m_offset.y ) / this.m_cellSize.y );
	var ix2 = Math.floor( ( naabb.right - this.m_offset.x ) / this.m_cellSize.x );
	var iy2 = Math.floor( ( naabb.bottom - this.m_offset.y ) / this.m_cellSize.y );
	if( ix1 < 0 ){
		ix1 = 0;
	}
	if( iy1 < 0 ){
		iy1 = 0;
	}
	if( ix1 >= this.m_resolution.x ){
		ix1 = this.m_resolution.x - 1;
	}
	if( iy1 >= this.m_resolution.y ){
		iy1 = this.m_resolution.y - 1;
	}
	if( ix2 < 0 ){
		ix2 = 0;
	}
	if( iy2 < 0 ){
		iy2 = 0;
	}
	if( ix2 >= this.m_resolution.x ){
		ix2 = this.m_resolution.x - 1;
	}
	if( iy2 >= this.m_resolution.y ){
		iy2 = this.m_resolution.y - 1;
	}
	for( var ix = ix1; ix <= ix2; ix++ ){ 
		for( var iy = iy1; iy <= iy2; iy++ ){ 
			this.m_cells[ ix ][ iy ].setBlocked( state );
		}
	}
	this.classifyCells();
}

RT.CellSpace.prototype.getOffset = function(){
	return( this.m_offset );
}

RT.CellSpace.prototype.getCellCoords = function( column, row ){
	var x = 0.5 * this.m_cellSize.x + column * this.m_cellSize.x + this.m_offset.x;
	var y = 0.5 * this.m_cellSize.y + row * this.m_cellSize.y + this.m_offset.y;
	return( { 'x':x, 'y':y } );
}

RT.CellSpace.prototype.getCellSize = function() {
	return( this.m_cellSize );
}

RT.CellSpace.prototype.getHalfCellSize = function() {
	return( new RT.Vec2( this.m_cellSize.x / 2.0, this.m_cellSize.y / 2.0 ) );
}

RT.CellSpace.prototype.register = function( object ) {
	if( ! object.hasCellInterface ){
		// TODO error
	}

	var objectCells = object.getCells();
	if( objectCells && objectCells.length ){
		// remove this object from the cells 
		// it is currently registered to
		for( var i = 0; i < objectCells.length; i++ ){
			objectCells[ i ].removeObject( object );
		}
		objectCells.splice( 0, objectCells.length );
	}

	var cells = this.getCells( object.getPosition(), object.getAABB() );
	if( cells && cells.length ){
		for( var i = 0; i < cells.length; i++ ){
			cells[ i ].addObject( object );
			objectCells.push( cells[ i ] );
		}
	}
}

RT.CellSpace.prototype.collide = function( object ){
	if( ! object.hasCellInterface ){
		// TODO error
	}
//	RT.trace( direction );
	var p = object.getPosition().clone();
	var state = false;
	var n = new RT.Vec2( 0.0, 0.0 );
	var ix = Math.floor( ( p.x - this.m_offset.x ) / this.m_cellSize.x );
	var iy = Math.floor( ( p.y - this.m_offset.y ) / this.m_cellSize.y );
	if( ix >= 0 && ix < this.m_resolution.x && iy >= 0 && iy < this.m_resolution.y ){
		var cell = this.m_cells[ ix ][ iy ];
		if( cell.getBlocked() ){
			var type = cell.getCellType();
			var naabb = cell.getNAABB();
			var d = undefined;
			var direction = undefined;
			if( type & RT.Cell.LEFT_WALL ){
				if( p.x >= naabb.left ){
					d = naabb.left - p.x;
					direction = 'x';
					n.x = -1.0;
					state = true;
				}
			}
			if( type & RT.Cell.RIGHT_WALL ){
				if( p.x <= naabb.right ){
					if( ( d == undefined ) || ( Math.abs( p.x - naabb.right ) < Math.abs( d ) ) ){
						d = naabb.right - p.x;
						direction = 'x';
						n.x = 1.0;
						state = true;
					}
				}
			}
			if( type & RT.Cell.FLOOR ){
				if( p.y >= naabb.top ){
					if( ( d == undefined ) || ( Math.abs( p.y - naabb.top ) < Math.abs( d ) ) ){
						d = naabb.top - p.y;
						direction = 'y';
						n.y = -1.0;
						state = true;
					}
				}
			}
			if( type & RT.Cell.CEILING ){
				if( p.y <= naabb.bottom ){
					if( ( d == undefined ) || ( Math.abs( p.y - naabb.bottom ) < Math.abs( d ) ) ){
						d = naabb.bottom - p.y;
						direction = 'y';
						n.y = 1.0;
						state = true;
					}
				}
			}
			if( direction == 'x' ){
				p.x += d;
			}
			else if( direction == 'y' ){
				p.y += d;
			}
			if( type & RT.Cell.ENCLOSED ){
				// must project to the nearest corner
				var c = new RT.Vec2( this.getCellCoords( ix, iy ) );
				var t = p.clone();
				t.dec( c );
				t.normalize();
				if( t.x != 0.0 ){
					t.x = parseInt( t.x / Math.abs( t.x ) );
				}
				if( t.y != 0.0 ){
					t.y = parseInt( t.y / Math.abs( t.y ) );
				}
				state = true;
				n.x = t.x;
				n.y = t.y;
				// t is the new index to the cell in the direction of p
				t.x += ix;
				t.y += iy;
				if( t.x >= 0 && t.x < this.m_resolution.x && t.y >= 0 && t.y < this.m_resolution.y && ( ! this.m_cells[ t.x ][ t.y ].getBlocked() ) ){
					c.inc( this.getCellCoords( t.x, t.y ) );
					c.sca( 0.5 );
					p.set( c );
				}
				else{
					// panic ! p is apparently not in a free cell (?)
					RT.trace( 'panic' );
				}
			}
		}
	}
	else{
		if( ix < 0 ){
			p.x = this.m_offset.x;
			n.x = -1.0;
			state = true;
		}
		else if( ix >= this.m_resolution.x ){
			p.x = this.m_offset.x + this.m_cellSize.x * this.m_resolution.x;
			n.x = +1.0;
			state = true;
		}
		if( iy < 0 ){
			p.y = this.m_offset.y;
			n.y = -1.0;
			state = true;
		}
		else if( iy >= this.m_resolution.y ){
			p.y = this.m_offset.y + this.m_cellSize.y * this.m_resolution.y;
			n.y = +1.0;
			state = true;
		}
	}
	if( state ){
		n.normalize();
	}
	return( { 'collide':state, 'position':p, 'normal':n } );
	// TODO aabb collide (?)
}

RT.CellSpace.prototype.draw = function( context, options ) {
	if( options.Cell ){
		for( var x = 0; x < this.m_resolution.x; x++ ){
			for( var y = 0; y < this.m_resolution.y; y++ ){
				this.m_cells[ x ][ y ].draw( context, options.Cell );
			}
		}
	}

	if( options.Grid ){
		context.strokeStyle = options.Grid.strokeStyle;
		context.lineWidth = options.Grid.lineWidth;
		context.beginPath();
		for( var x = 0; x < this.m_resolution.x; x++ ){
			context.moveTo( this.m_offset.x + x * this.m_cellSize.x, this.m_offset.y );
			context.lineTo( this.m_offset.x + x * this.m_cellSize.x, this.m_offset.y + this.m_dimensions.y );
		}
		for( var y = 0; y < this.m_resolution.y; y++ ){
			context.moveTo( this.m_offset.x, this.m_offset.y + y * this.m_cellSize.y );
			context.lineTo( this.m_offset.x + this.m_dimensions.x, this.m_offset.y + y * this.m_cellSize.y );
		}
		context.stroke();
	}
}

RT.CellSpace.prototype.onMouseMove = function( e ) {
}

RT.CellSpace.prototype.getCell = function( column, row ){
	if( column >= 0 && column < this.m_resolution.x && row >= 0 && row < this.m_resolution.y ){
		return( this.m_cells[ column ][ row ] );
	}
}

RT.CellSpace.prototype.getCellFromCoords = function( p ){
	return( this.getCells( p )[ 0 ] );
}

RT.CellSpace.prototype.selectNearestObject = function( selectionMask, position, aabb ){
	var minDistance = Number.MAX_VALUE;
	var nearestObject = undefined;
	var cells = this.getCells( position, aabb );
	if( cells && cells.length ){
		for( var i = 0; i < cells.length; i++ ){
			var objects = cells[ i ].getObjects();
//			console.log( 'row: ' + cells[ i ].m_row +' column: ' + cells[ i ].m_column );
//			console.log( 'mouse: ' + JSON.stringify( this.m_mouseNow ) );
			if( objects && objects.length ){
				for( var j = 0; j < objects.length; j++ ){
					if( objects[ j ].getCellSelectionMask( selectionMask ) ){
						var d = RT.Vec2.distance( position, objects[ j ].getPosition() );
						if( d < minDistance ){
							minDistance = d;
							nearestObject = objects[ j ];
						}
					}
				}
			}
		}
	}
	return( nearestObject );
}

RT.CellSpace.prototype.classifyCells = function(){
	for( var x = 0; x < this.m_resolution.x; x++ ){
		for( var y = 0; y < this.m_resolution.y; y++ ){
			this.m_cells[ x ][ y ].setCellType( 0 );
			if( this.m_cells[ x ][ y ].getBlocked() ){
				var count = 0;
				if( this.isFloor( x, y ) ){
					this.m_cells[ x ][ y ].setCellType( this.m_cells[ x ][ y ].getCellType() | RT.Cell.FLOOR );
				}
				if( this.isCeiling( x, y ) ){
					this.m_cells[ x ][ y ].setCellType( this.m_cells[ x ][ y ].getCellType() | RT.Cell.CEILING );
				}
				if( this.isLeftWall( x, y ) ){
					this.m_cells[ x ][ y ].setCellType( this.m_cells[ x ][ y ].getCellType() | RT.Cell.LEFT_WALL );
				}
				if( this.isRightWall( x, y ) ){
					this.m_cells[ x ][ y ].setCellType( this.m_cells[ x ][ y ].getCellType() | RT.Cell.RIGHT_WALL );
				}
				if( this.isUpperLeftLedge( x, y ) ){
					this.m_cells[ x ][ y ].setCellType( this.m_cells[ x ][ y ].getCellType() | RT.Cell.UPPER_LEFT_LEDGE );
				}
				if( this.isLowerLeftLedge( x, y ) ){
					this.m_cells[ x ][ y ].setCellType( this.m_cells[ x ][ y ].getCellType() | RT.Cell.LOWER_LEFT_LEDGE );
				}
				if( this.isUpperRightLedge( x, y ) ){
					this.m_cells[ x ][ y ].setCellType( this.m_cells[ x ][ y ].getCellType() | RT.Cell.UPPER_RIGHT_LEDGE );
				}
				if( this.isLowerRightLedge( x, y ) ){
					this.m_cells[ x ][ y ].setCellType( this.m_cells[ x ][ y ].getCellType() | RT.Cell.LOWER_RIGHT_LEDGE );
				}
				if( ! this.m_cells[ x ][ y ].getCellType() ){
					this.m_cells[ x ][ y ].setCellType( this.m_cells[ x ][ y ].getCellType() | RT.Cell.ENCLOSED );
				}
			}
		}
	}
}

RT.CellSpace.prototype.isFloor = function( column, row ){
	// a floor cell is a cell with at least one free cell above it,
	// so a floor can never be at the top. invalid values give false too.
	if( row <= 0 || row >= this.m_resolution.y || column < 0 || column >= this.m_resolution.x ){
		return( false );
	}
	return( this.m_cells[ column ][ row ].getBlocked() && ( ! this.m_cells[ column ][ row - 1 ].getBlocked() ) );
}

RT.CellSpace.prototype.isCeiling = function( column, row ){
	// a ceiling cell is a cell with at least one free cell underneath it,
	// so a ceiling can never be at the bottom. invalid values give false too.
	if( row < 0 || row >= ( this.m_resolution.y - 1 ) || column < 0 || column >= this.m_resolution.x ){
		return( false );
	}
	return( this.m_cells[ column ][ row ].getBlocked() && ( ! this.m_cells[ column ][ row + 1 ].getBlocked() ) );
}

RT.CellSpace.prototype.isLeftWall = function( column, row ){
	// a left wall is a cell with at least one free cell to the left of it,
	// so a left wall can never be at the left of the space. invalid values give false too.
	if( column <= 0  || column >= this.m_resolution.x || row < 0 || row >= this.m_resolution.y ){
		return( false );
	}
	return( this.m_cells[ column ][ row ].getBlocked() && ( ! this.m_cells[ column - 1 ][ row ].getBlocked() ) );
}

RT.CellSpace.prototype.isRightWall = function( column, row ){
	// a left wall is a cell with at least one free cell to the right of it,
	// so a left wall can never be at the right of the space. invalid row values give false too.
	if( column < 0 || column >= ( this.m_resolution.x - 1 ) || row < 0 || row >= this.m_resolution.y ){
		return( false );
	}
	return( this.m_cells[ column ][ row ].getBlocked() && ( ! this.m_cells[ column + 1 ][ row ].getBlocked() ) );
}

RT.CellSpace.prototype.isLowerLeftLedge = function( column, row ){
	// a lower left ledge has free neighbours to the left, lower left, and down
	if( column < 1 || column >= this.m_resolution.x || row < 0 || row >= ( this.m_resolution.y - 1 ) ){
		return( false );
	}
	return( this.m_cells[ column ][ row ].getBlocked() && ( ! this.m_cells[ column - 1 ][ row ].getBlocked() ) && ( ! this.m_cells[ column - 1 ][ row + 1 ].getBlocked() ) && ( ! this.m_cells[ column ][ row + 1 ].getBlocked() ) );
}

RT.CellSpace.prototype.isUpperLeftLedge = function( column, row ){
	// a upper left ledge has free neighbours to the left, upper left, and down
	if( column < 1 || column >= this.m_resolution.x || row < 1 || row >= this.m_resolution.y ){
		return( false );
	}
	return( this.m_cells[ column ][ row ].getBlocked() && ( ! this.m_cells[ column - 1 ][ row ].getBlocked() ) && ( ! this.m_cells[ column - 1 ][ row - 1 ].getBlocked() ) && ( ! this.m_cells[ column ][ row - 1 ].getBlocked() ) );
}

RT.CellSpace.prototype.isLowerRightLedge = function( column, row ){
	// a lower right ledge has free neighbours to the right, lower right, and down
	if( column < 0 || column >= ( this.m_resolution.x - 1 ) || row < 0 || row >= ( this.m_resolution.y - 1 ) ){
		return( false );
	}
	return( this.m_cells[ column ][ row ].getBlocked() && ( ! this.m_cells[ column + 1 ][ row ].getBlocked() ) && ( ! this.m_cells[ column + 1 ][ row + 1 ].getBlocked() ) && ( ! this.m_cells[ column ][ row + 1 ].getBlocked() ) );
}

RT.CellSpace.prototype.isUpperRightLedge = function( column, row ){
	// a upper right ledge has free neighbours to the right, upper right, and down
	if( column < 0 || column >= ( this.m_resolution.x - 1 ) || row < 1 || row >= this.m_resolution.y ){
		return( false );
	}
	return( this.m_cells[ column ][ row ].getBlocked() && ( ! this.m_cells[ column + 1 ][ row ].getBlocked() ) && ( ! this.m_cells[ column + 1 ][ row - 1 ].getBlocked() ) && ( ! this.m_cells[ column ][ row - 1 ].getBlocked() ) );
}

RT.CellSpace.prototype.getNearestCell = function( position, aabb, type ){
	var minDistance = Number.MAX_VALUE;
	var nearestCell = undefined;
	var cells = this.getCells( position, aabb );
	if( cells && cells.length ){
		for( var i = 0; i < cells.length; i++ ){
			if( cells[ i ].getCellType() == type ){
				var c = this.getCellCoords( cells[ i ].m_column, cells[ i ].m_row );
				var d = RT.Vec2.distance( position, c );
				if( d < minDistance ){
					minDistance = d;
					nearestCell = cells[ i ];
				}
			}
		}
	}
	return( nearestCell );
}

RT.CellSpace.prototype.destroy = function() {
	for( var x = 0; x < this.m_resolution.x; x++ ){
		for( var y = 0; y < this.m_resolution.y; y++ ){
			var objects = this.m_cells[ x ][ y ].getObjects();
			if( objects && objects.length ){
				for( var j = 0; j < objects.length; j++ ){
					objects[ j ].removeCells();
					objects[ j ].removeCellSpace();
				}
			}
		}
	}
	for( var x = 0; x < this.m_resolution.x; x++ ){
		for( var y = 0; y < this.m_resolution.y; y++ ){
			this.m_cells[ x ][ y ].destroy();
		}
		this.m_cells[ x ].splice( 0, this.m_cells[ x ].length );
	}
	this.m_cells.splice( 0, this.m_cells.length );
	delete this.m_cells;
}
