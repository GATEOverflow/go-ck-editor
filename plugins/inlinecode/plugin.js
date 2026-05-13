/**
 * Inline Code Plugin for CKEditor 4
 * Wraps selected text in <code> tags, or toggles code on/off
 * Button: `c` in toolbar. Shortcut: Ctrl+`
 */
CKEDITOR.plugins.add('inlinecode', {
    icons: 'inlinecode',
    hidpi: false,
    init: function(editor) {
        editor.addCommand('inlinecode', {
            exec: function(editor) {
                var selection = editor.getSelection();
                var ranges = selection && selection.getRanges();

                if (!ranges || ranges.length === 0) return;

                editor.fire('saveSnapshot');

                var range = ranges[0];

                // Check if we're inside a code element already
                var startEl = selection.getStartElement();
                var codeAncestor = startEl && startEl.getAscendant('code', true);

                if (codeAncestor) {
                    // Remove code: unwrap
                    var frag = new CKEDITOR.dom.documentFragment(editor.document);
                    while (codeAncestor.getChildCount()) {
                        frag.append(codeAncestor.getFirst());
                    }
                    frag.insertBefore(codeAncestor);
                    codeAncestor.remove();
                } else {
                    // Wrap selection in <code>
                    if (range.collapsed) return;

                    var code = editor.document.createElement('code');
                    var content = range.extractContents();
                    code.append(content);
                    range.insertNode(code);

                    // Select the new code element content
                    range.selectNodeContents(code);
                    selection.selectRanges([range]);
                }

                editor.fire('saveSnapshot');
            }
        });

        editor.ui.addButton('InlineCode', {
            label: 'Inline Code (Ctrl+`)',
            command: 'inlinecode',
            toolbar: 'basicstyles,100',
            icon: this.path + 'icons/inlinecode.png'
        });

        // Keyboard shortcut: Ctrl+` (backtick)
        editor.setKeystroke(CKEDITOR.CTRL + 192, 'inlinecode');
    }
});
