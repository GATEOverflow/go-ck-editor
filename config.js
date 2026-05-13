/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see https://ckeditor.com/legal/ckeditor-oss-license
 */

CKEDITOR.editorConfig = function( config ) {
	// Define changes to default configuration here.
	// For complete reference see:
	// https://ckeditor.com/docs/ckeditor4/latest/api/CKEDITOR_config.html

	// The toolbar groups arrangement, optimized for two toolbar rows.
	config.toolbarGroups = [
		{ name: 'clipboard',   groups: [ 'clipboard', 'undo' ] },
		{ name: 'editing',     groups: [ 'find', 'selection', 'spellchecker' ] },
		{ name: 'links' },
		{ name: 'insert' },
		{ name: 'forms' },
		{ name: 'tools' },
		{ name: 'document',	   groups: [ 'mode', 'document', 'doctools' ] },
		{ name: 'others' },
		 { name: 'pbckcode' },
		'/',
		{ name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ] },
		{ name: 'paragraph',   groups: [ 'list', 'blocks', 'bidi' ] },
		{ name: 'styles' },
		{ name: 'colors' },
		{ name: 'htmlSource' },
		{ name: 'about' }
	];

	// Remove some buttons provided by the standard plugins, which are
	// not needed in the Standard(s) toolbar.
	config.removeButtons = 'Underline,Subscript,Superscript,Anchor,Table';

	// Set the most common block elements.
	config.format_tags = 'p;h1;h2;h3;pre';

	config.versionCheck = false;
	//config.extraPlugins ='iframe,notification';
	config.removePlugins ='sourcedialog,eqneditor';
	config.extraPlugins ='inlinecode';
	config.scayt_autoStartup = true;
	config.allowedContent = true;
	config.extraAllowedContent = 'pre[*]{*}(*);iframe[*];*(*)'; // add other rules here
	//      config.allowedContent = 'pre[*]{*}(*)'; // add other rules here

	config.filebrowserUploadMethod = 'form';
	config.autosave = {
		messageType: "no"
	};

	// Simplify the dialog windows.
	config.removeDialogTabs = 'image:advanced;link:advanced';
	config.pbckcode = {
		// An optional class to your pre tag.
		cls : '',

		// The syntax highlighter you will use in the output view
		highlighter : 'PRETTIFY',

		// An array of the available modes for you plugin.
		// The key corresponds to the string shown in the select tag.
		// The value correspond to the loaded file for ACE Editor.
		modes :  [ ['C/C++', 'c_cpp'], ['Java', 'java'], ['SQL', 'sql'], ['HTML', 'html'], ['Python', 'python'], ['SH', 'sh'], ['Text', 'text']],

		// The theme of the ACE Editor of the plugin.
		theme : 'textmate',

		// Tab indentation (in spaces)
		tab_size : '4'
	};
};

// Inject dark mode CSS into CKEditor panel iframes (format/styles dropdowns)
CKEDITOR.on( 'instanceReady', function() {
	if ( document.documentElement.getAttribute( 'data-theme' ) !== 'dark' ) return;

	var darkCSS = 'body{background-color:#2a2a2a!important;color:#ccc!important}' +
		'.cke_panel_listItem a{color:#ccc!important}' +
		'.cke_panel_grouptitle{background:#333!important;color:#aaa!important}' +
		'.cke_panel_listItem a:hover,.cke_panel_listItem a:focus,' +
		'.cke_panel_listItem a:active,.cke_panel_listItem.cke_selected a{' +
		'background-color:#3a3a3a!important;color:#fff!important}';

	var observer = new MutationObserver( function( mutations ) {
		mutations.forEach( function( mutation ) {
			mutation.addedNodes.forEach( function( node ) {
				if ( node.nodeType !== 1 ) return;
				var panels = node.classList && node.classList.contains( 'cke_panel' )
					? [ node ]
					: Array.from( node.querySelectorAll ? node.querySelectorAll( '.cke_panel' ) : [] );
				panels.forEach( function( panel ) {
					var iframe = panel.querySelector( 'iframe' );
					if ( !iframe ) return;
					var inject = function() {
						try {
							var doc = iframe.contentDocument || iframe.contentWindow.document;
							if ( doc && doc.head && !doc.head.querySelector( 'style[data-dark-panel]' ) ) {
								var style = doc.createElement( 'style' );
								style.setAttribute( 'data-dark-panel', '1' );
								style.textContent = darkCSS;
								doc.head.appendChild( style );
							}
						} catch ( e ) {}
					};
					if ( iframe.contentDocument && iframe.contentDocument.readyState === 'complete' ) {
						inject();
					} else {
						iframe.addEventListener( 'load', inject );
					}
				} );
			} );
		} );
	} );

	observer.observe( document.body, { childList: true, subtree: true } );
} );
