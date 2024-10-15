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
	config.removeButtons = 'Underline,Subscript,Superscript,Anchor';

	// Set the most common block elements.
	config.format_tags = 'p;h1;h2;h3;pre';

	config.versionCheck = false;
	//config.extraPlugins ='iframe,notification';
	config.removePlugins ='sourcedialog,eqneditor';
	config.extraPlugins ='emoji';
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
