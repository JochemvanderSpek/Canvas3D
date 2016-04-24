"use strict";

RT.CreatePropertyIndicatorView = function( parentNode, object, property ){
	switch( $.type( object[ property ] ) ){
		case 'boolean': return( new RT.BooleanIndicatorView( parentNode, object, property ) );
		case 'number': return( new RT.NumberIndicatorView( parentNode, object, property ) );
		case 'string': return( new RT.StringIndicatorView( parentNode, object, property ) );
	}
}