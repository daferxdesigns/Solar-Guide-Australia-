import { ChangeEvent, ClipboardEvent, DragEvent, useEffect, useRef, useState } from 'react';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    minHeightClassName?: string;
    imageUploadUrl?: string;
    onUploadingChange?: (isUploading: boolean) => void;
}

type EditorMode = 'wysiwyg' | 'html';

export default function RichTextEditor({
    value,
    onChange,
    placeholder = 'Write here...',
    minHeightClassName = 'min-h-[360px]',
    imageUploadUrl,
    onUploadingChange,
}: RichTextEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    const htmlTextareaRef = useRef<HTMLTextAreaElement>(null);
    const selectionRef = useRef<Range | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [editorMode, setEditorMode] = useState<EditorMode>('wysiwyg');
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    useEffect(() => {
        const element = editorRef.current;
        if (!element) return;

        if (element.innerHTML !== value) {
            element.innerHTML = value || '';
        }
    }, [value, editorMode]);

    const saveSelection = () => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;
        selectionRef.current = selection.getRangeAt(0).cloneRange();
    };

    const restoreSelection = () => {
        const selection = window.getSelection();
        if (!selection || !selectionRef.current) return;
        selection.removeAllRanges();
        selection.addRange(selectionRef.current);
    };

    const handleModeSwitch = (mode: EditorMode) => {
        if (mode === 'html' && editorMode === 'wysiwyg') {
            // Switching from WYSIWYG to HTML - get current HTML
            const html = editorRef.current?.innerHTML || '';
            setEditorMode('html');
        } else if (mode === 'wysiwyg' && editorMode === 'html') {
            // Switching from HTML to WYSIWYG - set HTML content
            const html = htmlTextareaRef.current?.value || '';
            if (editorRef.current) {
                editorRef.current.innerHTML = html;
            }
            setEditorMode('wysiwyg');
        } else {
            setEditorMode(mode);
        }
    };

    const handleHtmlChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        onChange(event.target.value);
    };

    const runCommand = (
        command: string,
        commandValue?: string,
        options?: { useCss?: boolean },
    ) => {
        const element = editorRef.current;
        if (!element) return;

        element.focus();
        restoreSelection();

        if (options?.useCss) {
            document.execCommand('styleWithCSS', false, 'true');
        }

        document.execCommand(command, false, commandValue);
        saveSelection();
        onChange(element.innerHTML);
    };

    const runBlockCommand = (tag: string) => {
        runCommand('formatBlock', `<${tag}>`);
    };

    const insertHtml = (html: string) => {
        const element = editorRef.current;
        if (!element) return;

        element.focus();
        restoreSelection();
        document.execCommand('insertHTML', false, html);
        saveSelection();
        onChange(element.innerHTML);
    };

    const addLink = () => {
        saveSelection();
        const url = window.prompt('Enter URL');
        if (!url) return;
        runCommand('createLink', url.trim());
    };

    const uploadImageFile = async (file: File) => {
        if (!imageUploadUrl) return;

        setIsUploadingImage(true);
        onUploadingChange?.(true);
        setUploadError(null);

        try {
            const token = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';
            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch(imageUploadUrl, {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'X-CSRF-TOKEN': token,
                    'X-Requested-With': 'XMLHttpRequest',
                    Accept: 'application/json',
                },
                body: formData,
            });

            const payload = await response.json().catch(() => null);
            if (!response.ok || !payload?.url) {
                setUploadError(payload?.message || 'Unable to upload image.');
                return;
            }

            insertHtml(
                `<p><img src="${payload.url}" alt="${file.name.replace(/"/g, '&quot;')}" style="max-width: 100%; height: auto;" /></p>`,
            );
        } catch {
            setUploadError('Unable to upload image.');
        } finally {
            setIsUploadingImage(false);
            onUploadingChange?.(false);
        }
    };

    const handlePaste = async (event: ClipboardEvent<HTMLDivElement>) => {
        if (!imageUploadUrl) return;

        const imageFiles = Array.from(event.clipboardData.files).filter((file) => file.type.startsWith('image/'));
        if (imageFiles.length === 0) return;

        event.preventDefault();
        saveSelection();
        for (const file of imageFiles) {
            await uploadImageFile(file);
        }
    };

    const handleDrop = async (event: DragEvent<HTMLDivElement>) => {
        if (!imageUploadUrl) return;

        const imageFiles = Array.from(event.dataTransfer.files).filter((file) => file.type.startsWith('image/'));
        if (imageFiles.length === 0) return;

        event.preventDefault();
        saveSelection();
        for (const file of imageFiles) {
            await uploadImageFile(file);
        }
    };

    const handleFileSelection = async (event: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files ?? []);
        for (const file of files) {
            await uploadImageFile(file);
        }
        event.target.value = '';
    };

    const buttonClass =
        'rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50';
    const selectClass =
        'rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 outline-none';

    return (
        <div className="border border-slate-200 rounded-2xl overflow-hidden">
            {/* Editor Mode Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50">
                <button
                    type="button"
                    onClick={() => handleModeSwitch('wysiwyg')}
                    className={`px-4 py-2 text-sm font-medium transition ${
                        editorMode === 'wysiwyg'
                            ? 'bg-white text-slate-900 border-b-2 border-emerald-500'
                            : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                    Visual Editor
                </button>
                <button
                    type="button"
                    onClick={() => handleModeSwitch('html')}
                    className={`px-4 py-2 text-sm font-medium transition ${
                        editorMode === 'html'
                            ? 'bg-white text-slate-900 border-b-2 border-emerald-500'
                            : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                    HTML Source
                </button>
            </div>

            {editorMode === 'wysiwyg' ? (
                <>
                    {/* WYSIWYG Toolbar */}
                    <div className="flex flex-wrap gap-1 border-b border-slate-200 bg-slate-50 p-2">
                        <button type="button" className={buttonClass} onMouseDown={(e) => e.preventDefault()} onClick={() => runCommand('bold')}>
                            <strong>B</strong>
                        </button>
                        <button type="button" className={buttonClass} onMouseDown={(e) => e.preventDefault()} onClick={() => runCommand('italic')}>
                            <em>I</em>
                        </button>
                        <button type="button" className={buttonClass} onMouseDown={(e) => e.preventDefault()} onClick={() => runCommand('underline')}>
                            <u>U</u>
                        </button>
                        <button type="button" className={buttonClass} onMouseDown={(e) => e.preventDefault()} onClick={() => runCommand('strikeThrough')}>
                            <s>S</s>
                        </button>
                        <div className="mx-1 h-6 w-px bg-slate-300" />
                        <button type="button" className={buttonClass} onMouseDown={(e) => e.preventDefault()} onClick={() => runCommand('formatBlock', 'h1')}>
                            H1
                        </button>
                        <button type="button" className={buttonClass} onMouseDown={(e) => e.preventDefault()} onClick={() => runCommand('formatBlock', 'h2')}>
                            H2
                        </button>
                        <button type="button" className={buttonClass} onMouseDown={(e) => e.preventDefault()} onClick={() => runCommand('formatBlock', 'h3')}>
                            H3
                        </button>
                        <button type="button" className={buttonClass} onMouseDown={(e) => e.preventDefault()} onClick={() => runCommand('formatBlock', 'p')}>
                            P
                        </button>
                        <div className="mx-1 h-6 w-px bg-slate-300" />
                        <button type="button" className={buttonClass} onMouseDown={(e) => e.preventDefault()} onClick={() => runCommand('justifyLeft')}>
                            Left
                        </button>
                        <button type="button" className={buttonClass} onMouseDown={(e) => e.preventDefault()} onClick={() => runCommand('justifyCenter')}>
                            Center
                        </button>
                        <button type="button" className={buttonClass} onMouseDown={(e) => e.preventDefault()} onClick={() => runCommand('justifyRight')}>
                            Right
                        </button>
                        <button type="button" className={buttonClass} onMouseDown={(e) => e.preventDefault()} onClick={() => runCommand('justifyFull')}>
                            Justify
                        </button>
                        <div className="mx-1 h-6 w-px bg-slate-300" />
                        <button type="button" className={buttonClass} onMouseDown={(e) => e.preventDefault()} onClick={() => runCommand('insertUnorderedList')}>
                            Bullet
                        </button>
                        <button type="button" className={buttonClass} onMouseDown={(e) => e.preventDefault()} onClick={() => runCommand('insertOrderedList')}>
                            Numbered
                        </button>
                        <button type="button" className={buttonClass} onMouseDown={(e) => e.preventDefault()} onClick={addLink}>
                            Link
                        </button>
                        {imageUploadUrl && (
                            <button
                                type="button"
                                className={buttonClass}
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => {
                                    saveSelection();
                                    fileInputRef.current?.click();
                                }}
                            >
                                {isUploadingImage ? 'Uploading...' : 'Image'}
                            </button>
                        )}
                        <button type="button" className={buttonClass} onMouseDown={(e) => e.preventDefault()} onClick={() => insertHtml('<hr />')}>
                            Rule
                        </button>
                        <button type="button" className={buttonClass} onMouseDown={(e) => e.preventDefault()} onClick={() => runCommand('removeFormat')}>
                            Clear
                        </button>
                    </div>

                    {/* WYSIWYG Editor */}
                    <div
                        ref={editorRef}
                        contentEditable
                        suppressContentEditableWarning
                        onInput={() => onChange(editorRef.current?.innerHTML ?? '')}
                        onKeyUp={saveSelection}
                        onMouseUp={saveSelection}
                        onBlur={saveSelection}
                        onPaste={handlePaste}
                        onDrop={handleDrop}
                        onDragOver={(event) => imageUploadUrl && event.preventDefault()}
                        data-placeholder={placeholder}
                        className={`${minHeightClassName} guide-prose w-full p-4 text-sm outline-none empty:before:pointer-events-none empty:before:text-slate-400 empty:before:content-[attr(data-placeholder)] [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6`}
                    />
                </>
            ) : (
                /* HTML Source Editor */
                <textarea
                    ref={htmlTextareaRef}
                    value={value}
                    onChange={handleHtmlChange}
                    placeholder={placeholder}
                    className={`${minHeightClassName} w-full p-4 text-sm font-mono border-0 outline-none resize-none bg-white`}
                    style={{ minHeight: '420px' }}
                />
            )}

            {imageUploadUrl && editorMode === 'wysiwyg' && (
                <div className="border-t border-slate-200 px-4 py-2 text-xs text-slate-500">
                    Paste screenshots, drag images in, or use the Image button.
                    {uploadError && <span className="ml-2 text-red-600">{uploadError}</span>}
                </div>
            )}

            {editorMode === 'html' && (
                <div className="border-t border-slate-200 px-4 py-2 text-xs text-slate-500">
                    Edit HTML directly. Changes are saved automatically.
                </div>
            )}
        </div>
    );
}
