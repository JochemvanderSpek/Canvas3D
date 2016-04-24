"use strict";

RT.NumberEditView = function( parentNode, object, property, min, max, slider, integer, precision ){
	RT.PropertyEditView.call( this, parentNode, object, property );

	this.getBaseLayer().addClass( 'NumberEditView' );

	/*
	  .NumberEditView               -->+----------------------------------------------------+
	  .PropertyEditContainer        --->+--------------------------------------------------+| 
	  .PropertyEditElementContainer ---->+-------------+ +-------------+ +----------------+<---.PropertyEditValueContainer
	  .PropertyEditElement          ----->m_editElement| |[m_nameLabel]| |[m_valueElement]|<----.PropertyEditValue
	   .NumberEditSlider               ||+-------------+ +^------------+ +----------------+||
	                                   |+----------------^|--------------------------------+| 
	                                   +-----------------||---------------------------------+
	                                                     |.PropertyEditName                                                                                     
	                                                     .PropertyEditNameContainer
	*/

	this.m_hasSlider = ( slider !== undefined ? slider : false );

	var editContainer = $( '<div class="PropertyEditContainer"/>' );

	if( this.m_hasSlider ){
		var container = $( '<div class="PropertyEditElementContainer">' );
		this.m_editElement = $( '<div class="PropertyEditElement NumberEditSlider"/>' );
		this.m_editElement.slider();
		this.m_editElement.on( 'slide', $.proxy( this.onValueChanged, this ) );
		container.append( this.m_editElement );
		editContainer.append( container );

		container = $( '<div class="PropertyEditNameContainer">' );
		this.m_nameLabel = $( '<div class="PropertyEditName TextMedium">' + this.m_property + '</div>' );
		container.append( this.m_nameLabel );	
		editContainer.append( container );	

		container = $( '<div class="PropertyEditValueContainer">' );
		this.m_valueElement = $( '<div class="PropertyEditValue TextSmall"/>' );
		container.append( this.m_valueElement );
		editContainer.append( container );
	}
	else{
		var container = $( '<div class="PropertyEditElementContainer">' );
		this.m_editElement = $( '<input class="PropertyEditElement StringEditTextField" type="text" />' );
		this.m_editElement.on( 'input', $.proxy( this.onValueChanged, this ) );
		this.m_editElement.on( 'change', $.proxy( this.onValueChanged, this ) );
		this.m_editElement.on( 'keyup', $.proxy( this.onValueChanged, this ) );
		this.m_editElement.on( 'propertychange', $.proxy( this.onValueChanged, this ) );
		container.append( this.m_editElement );
		editContainer.append( container );

		container = $( '<div class="PropertyEditNameContainer">' );
		this.m_nameLabel = $( '<div class="PropertyEditName TextMedium">' + this.m_property + '</div>' );
		container.append( this.m_nameLabel );
		editContainer.append( container );
	}

	this.m_min = min;
	this.m_max = max;
	this.m_isInteger = ( integer ? true : false );
	this.m_precision = ( precision === undefined ? 4 : precision );

	this.getBaseLayer().append( editContainer );
}

RT.makeSubClass( RT.NumberEditView, RT.PropertyEditView );

RT.NumberEditView.prototype.onValueChanged = function( e ) {
	e.stopPropagation();

	if( this.syncPropertyToView() ){
		if( this.m_valueElement ){
			if( this.m_isInteger ){
				this.m_valueElement.html( '(' + this.m_object[ this.m_property ] + ')' );
			}
			else{
				this.m_valueElement.html( '(' + this.m_object[ this.m_property ].toFixed( this.m_precision ) + ')' );
			}
		}

		this.dispatchEvent( new RT.Event( 'valuechanged', this, this.getValue() ) );
	}
}

RT.NumberEditView.prototype.syncPropertyToView = function( e ) {
	// reimplemented from PropertyEditView
	var value;
	if( this.m_hasSlider ){
		if( this.m_min !== undefined && this.m_max !== undefined ){
			value = ( this.m_editElement.slider( 'value' ) / 100.0 ) * ( this.m_max - this.m_min ) + this.m_min;
		}
		else{
			value = this.m_editElement.slider( 'value' );
		}
	}
	else{
		value = parseFloat( this.m_editElement.val() );
	}
	if( parseFloat( value ) != parseFloat( this.m_object[ this.m_property ] ) ){
		this.m_object[ this.m_property ] = this.limitValue( value );
		return( true );
	}
	else{
		return( false );
	}
}

RT.NumberEditView.prototype.syncViewToProperty = function( e ) {
	// reimplemented from PropertyEditView
	var changed = false;
	if( this.m_hasSlider ){
		var value = ( ( this.m_object[ this.m_property ] - this.m_min ) / ( this.m_max - this.m_min ) ) * 100;
		if( this.m_editElement.slider( 'value' ) != value ){
			this.m_editElement.slider( 'value', value );
			changed = true;
		}
	}
	else{
		var value = parseFloat( this.m_object[ this.m_property ] );
		if( parseFloat( this.m_editElement.val() ) != parseFloat( value ) ){
			this.m_editElement.val( this.limitValue( value ) );
			changed = true;
		}
	}
	if( changed ){
		if( this.m_isInteger ){
			if( this.m_valueElement ){
				this.m_valueElement.html( '(' + this.m_object[ this.m_property ] + ')' );
			}
		}
		else{
			if( this.m_valueElement ){
				this.m_valueElement.html( '(' + this.m_object[ this.m_property ].toFixed( this.m_precision ) + ')' );
			}
		}
	}
	return( changed );
}

RT.NumberEditView.prototype.limitValue = function( value ) {
	if( isNaN( value ) || ( ! isFinite( value ) ) ){
		value = 0.0;
	}
	if( this.m_isInteger ){
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

RT.NumberEditView.prototype.setEnabled = function( state ) {
	if( state ){
		if( this.m_hasSlider ){
			if( this.m_editElement ){ this.m_editElement.slider( 'enable' ); }
		}
		if( this.m_editElement ){ this.m_editElement.removeAttr( 'disabled' ); }
		if( this.m_editElement ){ this.m_editElement.removeClass( 'PropertyEditDisabled' ); }
		if( this.m_editElement ){ this.m_editElement.addClass( 'PropertyEditEnabled' ); }
		if( this.m_valueElement ){ this.m_valueElement.removeClass( 'PropertyEditDisabled' ); }
		if( this.m_valueElement ){ this.m_valueElement.addClass( 'PropertyEditEnabled' ); }
		if( this.m_nameLabel ){ this.m_nameLabel.removeClass( 'PropertyEditDisabled' ); }
		if( this.m_nameLabel ){ this.m_nameLabel.addClass( 'PropertyEditEnabled' ); }
	}
	else{
		if( this.m_hasSlider ){
			if( this.m_editElement ){ this.m_editElement.slider( 'disable' ); }
		}
		if( this.m_editElement ){ this.m_editElement.attr( 'disabled', 'disabled' ); }
		if( this.m_editElement ){ this.m_editElement.removeClass( 'PropertyEditEnabled' ); }
		if( this.m_editElement ){ this.m_editElement.addClass( 'PropertyEditDisabled' ); }
		if( this.m_valueElement ){ this.m_valueElement.removeClass( 'PropertyEditEnabled' ); }
		if( this.m_valueElement ){ this.m_valueElement.addClass( 'PropertyEditDisabled' ); }
		if( this.m_nameLabel ){ this.m_nameLabel.removeClass( 'PropertyEditEnabled' ); }
		if( this.m_nameLabel ){ this.m_nameLabel.addClass( 'PropertyEditDisabled' ); }
	}
}
