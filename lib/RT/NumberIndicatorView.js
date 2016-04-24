"use strict";

RT.NumberIndicatorView = function( parentNode, object, property, color, min, max, showText, integer, precision ){
	RT.PropertyIndicatorView.call( this, parentNode, object, property );

	this.getBaseLayer().addClass( 'NumberIndicatorView' );

	//  .NumberIndicatorView          -->+-----------------------------------------------------+
	//  .PropertyIndicatorLayer       --->+-------------------------------------------+        | 
	//  .PropertyNameContainer        --->+-------------+                    +----------------+<---.PropertyValueContainer
	//  .PropertyName                 ---->m_nameLabel  | m_indicatorLayer   |[m_nameLabel]   |<----.PropertyValue
	//                                   |+-------------+                    +----------------+|
	//                                   |+-------------------------------------------+        | 
	//                                   +-----------------------------------------------------+

	this.m_indicatorLayer = $( '<div class="PropertyIndicatorLayer">' );
	this.m_indicatorLayer.css( 'background-color', color );
	this.getBaseLayer().append( this.m_indicatorLayer );

	var container = $( '<div class="PropertyNameContainer">' );
	this.m_nameLabel = $( '<div class="PropertyName TextMedium">' + this.m_property + '</div>' );
	container.append( this.m_nameLabel );	
	this.getBaseLayer().append( container );	

	container = $( '<div class="PropertyValueContainer">' );
	this.m_valueLabel = $( '<div class="PropertyValue TextSmall"/>' );
	container.append( this.m_valueLabel );
	this.getBaseLayer().append( container );

	this.m_min = min;
	this.m_max = max;
	this.m_integer = integer;
	this.m_precision = precision;
	this.m_showText = showText;
	if( ! this.m_showText ){
		this.m_nameLabel.hide();
		this.m_valueLabel.hide();
	}
}

RT.makeSubClass( RT.NumberIndicatorView, RT.PropertyIndicatorView );

RT.NumberIndicatorView.prototype.syncPropertyToView = function( e ) {
	// reimplemented from PropertyEditView
	var value = parseFloat( this.m_valueLabel.html() );
	if( parseFloat( value ) != parseFloat( this.m_object[ this.m_property ] ) ){
		this.m_object[ this.m_property ] = this.limitValue( value );
		return( true );
	}
	else{
		return( false );
	}
}

RT.NumberIndicatorView.prototype.syncViewToProperty = function( e ) {
	// reimplemented from PropertyEditView
	var value = this.limitValue( parseFloat( this.m_object[ this.m_property ] ) );
	if( parseFloat( this.m_valueLabel.html() ) != value ){
		this.m_valueLabel.html( this.limitValue( value ) );
		if( this.m_integer ){
			if( this.m_valueElement ){
				this.m_valueElement.html( this.m_object[ this.m_property ] );
			}
		}
		else{
			if( this.m_valueElement ){
				this.m_valueElement.html( this.m_object[ this.m_property ].toFixed( this.m_precision ) );
			}
		}

		var pct = 100.0 * ( ( value - this.m_min ) / ( this.m_max - this.m_min ) );
		// avoid hiding the layer entirely
		if( pct < 5.0 ){
			pct = 5.0;
		}
		this.m_indicatorLayer.css( 'width', pct + '%' );

		return( true );
	}
	else{
		return( false );
	}
}

RT.NumberIndicatorView.prototype.limitValue = function( value ) {
	if( isNaN( value ) || ( ! isFinite( value ) ) ){
		value = 0.0;
	}
	if( this.m_integer ){
		value = Math.round( value );
	}
	if( this.m_min !== undefined ){
		if( value < this.m_min ){
			value = this.m_min;
		}
	}
	if( this.m_max !== undefined ){
		if( value > this.m_max ){
			value = this.m_max;
		}
	}
	return( value );
}


RT.NumberIndicatorView.prototype.setEnabled = function( state ) {
	if( state ){
		if( this.m_valueLabel ){ this.m_valueLabel.removeClass( 'PropertyIndicatorDisabled' ); }
		if( this.m_valueLabel ){ this.m_valueLabel.addClass( 'PropertyIndicatorEnabled' ); }
		if( this.m_nameLabel ){ this.m_nameLabel.removeClass( 'PropertyIndicatorDisabled' ); }
		if( this.m_nameLabel ){ this.m_nameLabel.addClass( 'PropertyIndicatorEnabled' ); }
	}
	else{
		if( this.m_valueLabel ){ this.m_valueLabel.removeClass( 'PropertyIndicatorEnabled' ); }
		if( this.m_valueLabel ){ this.m_valueLabel.addClass( 'PropertyIndicatorDisabled' ); }
		if( this.m_nameLabel ){ this.m_nameLabel.removeClass( 'PropertyIndicatorEnabled' ); }
		if( this.m_nameLabel ){ this.m_nameLabel.addClass( 'PropertyIndicatorDisabled' ); }
	}
}
