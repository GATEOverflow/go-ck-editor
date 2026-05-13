/**
 * Equation Editor Dialog for CKEditor v4
 * Self-contained LaTeX editor with KaTeX/MathJax preview.
 * Replaces CodeCogs dependency.
 */
window.CCounter = window.CCounter || 0;

CKEDITOR.dialog.add("eqneditorDialog", function(editor) {
    window.CCounter++;
    var cid = window.CCounter;
    var previewId = 'eqn-preview-' + cid;
    var latexId = 'eqn-latex-' + cid;
    var typeId = 'eqn-type-' + cid;

    function updatePreview() {
        var ta = document.getElementById(latexId);
        var box = document.getElementById(previewId);
        if (!ta || !box) return;
        var latex = ta.value.trim();

        if (!latex) {
            box.innerHTML = '<span style="color:#999;">Type a LaTeX equation above</span>';
            return;
        }

        if (typeof katex !== 'undefined') {
            try {
                katex.render(latex, box, { displayMode: true, throwOnError: false });
                return;
            } catch (e) {}
        }

        if (typeof MathJax !== 'undefined') {
            box.innerHTML = '$$' + latex.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '$$';
            if (typeof MathJax.typesetPromise === 'function') {
                MathJax.typesetPromise([box]);
            } else if (MathJax.Hub) {
                MathJax.Hub.Queue(['Typeset', MathJax.Hub, box]);
            }
            return;
        }

        box.innerHTML = '<code style="font-size:16px;">' + latex.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</code>';
    }

    return {
        title: editor.lang.eqneditor.title,
        minWidth: 550,
        minHeight: 350,
        resizable: CKEDITOR.DIALOG_RESIZE_BOTH,
        contents: [{
            id: 'eqnTab',
            label: 'EqnEditor',
            elements: [
                {
                    type: 'html',
                    html: '<div style="margin-bottom:6px;"><label style="font-weight:bold;">Type: </label><select id="' + typeId + '" class="cke_eqn_select" style="padding:4px 8px;border-radius:4px;border:1px solid #aaa;">  <option value="inline">Inline ($...$)</option><option value="display">Display ($$...$$)</option></select></div>'
                },
                {
                    type: 'html',
                    html: '<label for="' + latexId + '" style="font-weight:bold;">Equation (LaTeX):</label>'
                },
                {
                    type: 'html',
                    html: '<textarea id="' + latexId + '" rows="5" class="cke_eqn_textarea" style="border:1px solid #8fb6bd; width:540px; font-size:16px; padding:8px; border-radius:4px; font-family:\'JetBrains Mono\',\'Fira Code\',monospace; background-color:#fafafa;"></textarea>'
                },
                {
                    type: 'html',
                    html: '<label style="font-weight:bold; margin-top:8px; display:block;">Preview:</label>'
                },
                {
                    type: 'html',
                    html: '<div id="' + previewId + '" class="cke_eqn_preview" style="min-height:50px; padding:12px; border:1px solid #ccc; border-radius:4px; background:#fafafa; font-size:18px; text-align:center; overflow:auto;"></div>'
                },
                {
                    type: 'html',
                    html: '<div class="cke_eqn_help" style="margin-top:8px; font-size:11px; color:#666;">Common: \\frac{a}{b} &nbsp; \\sqrt{x} &nbsp; x^{2} &nbsp; \\sum_{i=1}^{n} &nbsp; \\int_{a}^{b} &nbsp; \\alpha \\beta \\gamma &nbsp; \\leq \\geq \\neq &nbsp; \\times \\div &nbsp; \\infty</div>'
                }
            ]
        }],
        onLoad: function() {
            var ta = document.getElementById(latexId);
            if (ta) {
                ta.addEventListener('input', updatePreview);
                ta.addEventListener('keyup', updatePreview);
            }
        },
        onShow: function() {
            var latex = '';
            var eqnType = 'inline';
            var sel = editor.getSelection();
            var el = sel ? sel.getStartElement() : null;

            this._editElement = null;

            if (el) {
                var mathEl = el.getAscendant(function(node) {
                    return node.type === CKEDITOR.NODE_ELEMENT &&
                        (node.hasClass('math-tex') || node.getAttribute('data-latex'));
                }, true);
                if (mathEl) {
                    latex = mathEl.getAttribute('data-latex') || '';
                    if (!latex) {
                        var text = mathEl.getText();
                        var m = text.match(/^\$\$([\s\S]*)\$\$$/);
                        if (m) { latex = m[1]; eqnType = 'display'; }
                        else {
                            m = text.match(/^\\\(([\s\S]*)\\\)$/);
                            if (m) { latex = m[1]; }
                            else {
                                m = text.match(/^\$([\s\S]*)\$$/);
                                if (m) { latex = m[1]; }
                            }
                        }
                    }
                    this._editElement = mathEl;
                } else {
                    var imgEl = el.getAscendant('img', true);
                    if (imgEl) {
                        var src = imgEl.getAttribute('src') || '';
                        var sMatch = src.match(/(gif|svg)\.latex\?(.*)/);
                        if (sMatch) {
                            latex = decodeURIComponent(sMatch[2]);
                            this._editElement = imgEl;
                        }
                    }
                }
            }

            var ta = document.getElementById(latexId);
            var selEl = document.getElementById(typeId);
            if (ta) ta.value = latex;
            if (selEl) selEl.value = eqnType;
            setTimeout(updatePreview, 100);
        },
        onOk: function() {
            var ta = document.getElementById(latexId);
            var selEl = document.getElementById(typeId);
            var latex = ta ? ta.value.trim() : '';
            if (!latex) return;

            var eqnType = selEl ? selEl.value : 'inline';
            var wrapper = eqnType === 'display' ? '$$' : '$';
            var wrappedLatex = wrapper + latex + wrapper;

            var span = editor.document.createElement('span');
            span.addClass('math-tex');
            span.setAttribute('data-latex', latex);
            span.setText(wrappedLatex);

            if (this._editElement) {
                span.replace(this._editElement);
                this._editElement = null;
            } else {
                editor.insertElement(span);
            }

            setTimeout(function() {
                if (typeof MathJax !== 'undefined') {
                    if (typeof MathJax.typesetPromise === 'function') {
                        MathJax.typesetPromise();
                    } else if (MathJax.Hub) {
                        MathJax.Hub.Queue(['Typeset', MathJax.Hub]);
                    }
                }
            }, 200);
        }
    };
});
