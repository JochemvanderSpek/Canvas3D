"use strict";

RT.CreatePropertyEditView = function( parentNode, object, property ){
	switch( $.type( object[ property ] ) ){
		case 'boolean': return( new RT.BooleanEditView( parentNode, object, property ) );
		case 'number': return( new RT.NumberEditView( parentNode, object, property ) );
		case 'string': return( new RT.StringEditView( parentNode, object, property ) );
	}
}