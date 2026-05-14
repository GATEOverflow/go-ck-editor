/**
 * pbckcode - CKEditor Code Block Dialog (Modernized)
 * Features: ACE editor, dark mode auto-detection, line numbers toggle
 */
CKEDITOR.dialog.add('pbckcodeDialog', function(editor) {
    var aceEditor, aceSession, whitespace;
    var highlighter = new PBSyntaxHighlighter(editor.settings.highlighter);

    function isDarkMode() {
        var html = document.documentElement;
        return html.getAttribute('data-theme') === 'dark' ||
               document.body.classList.contains('dark-theme');
    }

    function getAceTheme() {
        return isDarkMode() ? 'ace/theme/monokai' : 'ace/theme/textmate';
    }

    return {
        title: editor.lang.pbckcode.title,
        minWidth: 650,
        minHeight: 450,
        contents: [{
            id: 'editor',
            label: editor.lang.pbckcode.editor,
            elements: [
                {
                    type: 'hbox',
                    widths: ['40%', '25%', '35%'],
                    children: [
                        {
                            type: 'select',
                            id: 'code-select',
                            className: 'cke_pbckcode_form',
                            label: editor.lang.pbckcode.mode,
                            items: editor.settings.modes,
                            'default': editor.settings.modes[0][1],
                            setup: function(element) {
                                if (element) {
                                    var pre = element.getAscendant('pre', true);
                                    if (pre) this.setValue(pre.getAttribute('data-pbcklang'));
                                }
                            },
                            commit: function(element) {
                                if (element) {
                                    var pre = element.getAscendant('pre', true);
                                    if (pre) pre.setAttribute('data-pbcklang', this.getValue());
                                }
                            },
                            onChange: function() {
                                if (aceSession) {
                                    aceSession.setMode('ace/mode/' + this.getValue());
                                }
                            }
                        },
                        {
                            type: 'select',
                            id: 'code-tabsize-select',
                            className: 'cke_pbckcode_form',
                            label: editor.lang.pbckcode.tabSize,
                            items: [['1'], ['2'], ['4'], ['8']],
                            'default': editor.settings.tab_size,
                            setup: function(element) {
                                if (element) {
                                    var pre = element.getAscendant('pre', true);
                                    if (pre) this.setValue(pre.getAttribute('data-pbcktabsize'));
                                }
                            },
                            commit: function(element) {
                                if (element) {
                                    var pre = element.getAscendant('pre', true);
                                    if (pre) pre.setAttribute('data-pbcktabsize', this.getValue());
                                }
                            },
                            onChange: function() {
                                if (aceSession && whitespace) {
                                    whitespace.convertIndentation(aceSession, ' ', this.getValue());
                                    aceSession.setTabSize(this.getValue());
                                }
                            }
                        },
                        {
                            type: 'checkbox',
                            id: 'code-linenums',
                            className: 'cke_pbckcode_form',
                            label: 'Line numbers',
                            'default': true,
                            setup: function(element) {
                                if (element) {
                                    var pre = element.getAscendant('pre', true);
                                    if (pre) {
                                        var val = pre.getAttribute('data-linenums');
                                        var cls = pre.getAttribute('class') || '';
                                        if (val !== null) {
                                            this.setValue(val !== 'false');
                                        } else {
                                            this.setValue(cls.indexOf('no-linenums') === -1);
                                        }
                                    }
                                }
                            },
                            commit: function(element) {
                                if (element) {
                                    var pre = element.getAscendant('pre', true);
                                    if (pre) pre.setAttribute('data-linenums', this.getValue() ? 'true' : 'false');
                                }
                            }
                        }
                    ]
                },
                {
                    type: 'html',
                    html: '<div></div>',
                    id: 'code-textarea',
                    className: 'cke_pbckcode_ace',
                    style: 'position: absolute; top: 100px; left: 10px; right: 10px; bottom: 10px; border-radius: 6px; overflow: hidden;',
                    setup: function(element) {
                        // Prefer data-rawcode (set on save) to avoid browser
                        // contenteditable whitespace normalization stripping
                        // leading spaces/tabs from some lines.
                        var pre = element.getAscendant('pre', true);
                        var raw = pre ? pre.getAttribute('data-rawcode') : null;
                        if (raw !== null && raw !== '') {
                            aceEditor.setValue(raw, -1);
                            return;
                        }
                        // Fallback for older content without data-rawcode
                        var html = element.getHtml();
                        html = html
                            .replace(/<br\/>/g, '\n')
                            .replace(/<br>/g, '\n')
                            .replace(/&lt;/g, '<')
                            .replace(/&gt;/g, '>')
                            .replace(/&amp;/g, '&')
                            .replace(/&nbsp;/g, ' ')
                            .replace(/&#9;/g, '\t');
                        aceEditor.setValue(html, -1);
                    },
                    commit: function(element) {
                        var code = aceEditor.getValue();
                        element.setText(code);
                        // Store raw code to survive contenteditable whitespace normalization
                        var pre = element.getAscendant('pre', true);
                        if (pre) pre.setAttribute('data-rawcode', code);
                    }
                }
            ]
        }],

        onLoad: function() {
            var dialog = this;
            var aceContainer = dialog.getContentElement('editor', 'code-textarea').getElement().getId();

            aceEditor = ace.edit(aceContainer);
            editor.aceEditor = aceEditor;

            aceEditor.setTheme(getAceTheme());
            aceEditor.setHighlightActiveLine(true);
            aceEditor.setShowInvisibles(false);
            aceEditor.setFontSize(14);
            aceEditor.setOptions({
                showPrintMargin: false,
                wrap: true
            });

            aceSession = aceEditor.getSession();
            aceSession.setMode('ace/mode/' + editor.settings.modes[0][1]);
            aceSession.setTabSize(editor.settings.tab_size);
            aceSession.setUseSoftTabs(true);

            whitespace = ace.require('ace/ext/whitespace');

            // After ACE handles a keystroke, stop it from bubbling up to
            // CKEditor's dialog listener (which would cycle focus on Tab,
            // treat Space as a button press, etc.).
            // Bubble phase (false) is correct: ACE's target-phase handler
            // runs first, then our listener fires on the container and stops
            // the event before it reaches the dialog element.
            var _aceEl = aceEditor.container;
            function _stopBubble(e) { e.stopPropagation(); }
            _aceEl.addEventListener('keydown',  _stopBubble, false);
            _aceEl.addEventListener('keypress', _stopBubble, false);
            _aceEl.addEventListener('keyup',    _stopBubble, false);

            // Watch for dark mode changes
            var observer = new MutationObserver(function() {
                aceEditor.setTheme(getAceTheme());
            });
            observer.observe(document.documentElement, {
                attributes: true,
                attributeFilter: ['data-theme']
            });
            observer.observe(document.body, {
                attributes: true,
                attributeFilter: ['class']
            });
        },

        onShow: function() {
            var sel = editor.getSelection().getStartElement();
            var pre = sel ? sel.getAscendant('pre', true) : null;
            var element;

            if (pre && pre.getName() === 'pre') {
                element = pre;
                if (highlighter.getTag() !== 'pre') {
                    element = pre.getChild(0);
                }
                this.insertMode = false;
            } else {
                element = new CKEDITOR.dom.element('pre');
                if (highlighter.getTag() !== 'pre') {
                    element.append(new CKEDITOR.dom.element('code'));
                }
                this.insertMode = true;
            }

            this.element = element;

            // Update theme on each show
            aceEditor.setTheme(getAceTheme());
            aceEditor.focus();
            aceEditor.setValue('');

            if (!this.insertMode) {
                this.setupContent(this.element);
            }
        },

        onOk: function() {
            var pre, codeEl;
            pre = codeEl = this.element;

            if (this.insertMode) {
                if (highlighter.getTag() !== 'pre') {
                    codeEl = this.element.getChild(0);
                }
            } else {
                pre = codeEl.getAscendant('pre', true);
            }

            this.commitContent(codeEl);

            // Build class based on highlighter and line numbers
            var lang = pre.getAttribute('data-pbcklang');
            var lineNums = pre.getAttribute('data-linenums') !== 'false';

            if (editor.settings.highlighter === 'PRETTIFY') {
                var cls = 'prettyprint linenums' + (lineNums ? '' : ' no-linenums') + ' lang-' + lang;
                if (editor.settings.cls) cls += ' ' + editor.settings.cls;
                codeEl.setAttribute('class', cls);
            } else {
                highlighter.setCls(lang + ' ' + editor.settings.cls);
                codeEl.setAttribute('class', highlighter.getCls());
            }

            if (this.insertMode) {
                editor.insertElement(pre);
            }
        }
    };
});

// Handle dialog resize for ACE editor
CKEDITOR.dialog.on('resize', function(evt) {
    var ace = evt.editor.aceEditor;
    if (ace) ace.resize();
});