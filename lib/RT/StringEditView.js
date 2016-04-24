"use strict";

RT.StringEditView = function( parentNode, object, property ){
	RT.PropertyEditView.call( this, parentNode, object, property );

	this.getBaseLayer().addClass( 'StringEditView' );

	/*
	    .PropertyEditContainer        -->+-------------------------------+  
	    .PropertyEditElementContainer --->+-------------+ +-------------+<---- .PropertyEditNameContainer  
	    .PropertyEditElement          ---->m_editElement| |[m_nameLabel]<----- .PropertyEditName
	     .StringEditTextField            |+-------------+ +-------------+|
	                                     +-------------------------------+
	*/
	var editContainer = $( '<div class="PropertyEditContainer"/>' );

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

	this.getBaseLayer().append( editContainer );

}

RT.makeSubClass( RT.StringEditView, RT.PropertyEditView );

RT.StringEditView.prototype.onValueChanged = function( e ) {

	if( this.syncPropertyToView() ){
		if( this.m_valueElement ){
			this.m_valueElement.html( this.m_object[ this.m_property ] );
		}
		
		this.dispatchEvent( new RT.Event( 'valuechanged', this, this.getValue() ) );
	}
}

RT.StringEditView.prototype.setTextFilter = function( f ) {
	this.m_textFilter = f;
}

RT.StringEditView.prototype.syncPropertyToView = function( e ) {
	// reimplemented from StringEditView
	var value = this.m_editElement.val();
	if( this.m_textFilter ){
		value = this.m_textFilter( value );
	}
	if( this.m_object[ this.m_property ] != value ){
		this.m_object[ this.m_property ] = value;
		return( true );
	}
	else{
		return( false );
	}
}

RT.StringEditView.prototype.syncViewToProperty = function( e ) {
	// reimplemented from StringEditView
	var value = this.m_object[ this.m_property ];
	if( this.m_textFilter ){
		value = this.m_textFilter( value );
	}
	var ev = ( '' + this.m_editElement.val() );
	if( ev != ( '' + value ) ){
		this.m_editElement.val( value );
		return( true );
	}
	else{
		return( false );
	}
}


RT.StringEditView.prototype.setEnabled = function( state ) {
	// reimplemented from StringEditView
	if( state ){
		if( this.m_editElement ){ this.m_editElement.removeAttr( 'disabled' ); }
		if( this.m_editElement ){ this.m_editElement.removeClass( 'PropertyEditDisabled' ); }
		if( this.m_editElement ){ this.m_editElement.addClass( 'PropertyEditEnabled' ); }
		if( this.m_nameLabel ){ this.m_nameLabel.removeClass( 'PropertyEditDisabled' ); }
		if( this.m_nameLabel ){ this.m_nameLabel.addClass( 'PropertyEditEnabled' ); }
	}
	else{
		if( this.m_editElement ){ this.m_editElement.attr( 'disabled', 'disabled' ); }
		if( this.m_editElement ){ this.m_editElement.removeClass( 'PropertyEditEnabled' ); }
		if( this.m_editElement ){ this.m_editElement.addClass( 'PropertyEditDisabled' ); }
		if( this.m_nameLabel ){ this.m_nameLabel.removeClass( 'PropertyEditEnabled' ); }
		if( this.m_nameLabel ){ this.m_nameLabel.addClass( 'PropertyEditDisabled' ); }
	}
}
