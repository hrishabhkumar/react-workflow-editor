
import React, { useState, useEffect, useRef } from 'react';
import Editor from './Editor';
import Toolbar from '../toolbar/Toolbar';
import './editorContainer.scss';

const iconSize = 34;
const toolbarPadding = 2;

const EditorContainer = ({
    iconWritingMode,
    template,
    data,
    style,
    workspaceStyle,
    onClick,
    onChange,
    workflowId,
}) => {
    const containerRef = useRef();

    return (
        <div
            className="react-workflow-editor-container-wrapper"
            id={workflowId || 'react-workflow-editor-container-wrapper'}
            style={style}
            ref={containerRef}
        >
            <div className="react-workflow-editor-toolbar-container-wrapper">
                <Toolbar
                    template={template}
                    iconWritingMode={iconWritingMode}
                />
            </div>
            <Editor
                data={data}
                style={workspaceStyle}
                onChange={onChange}
                onClick={onClick}
                template={template}
            />
            <div
                ref={(ref) => { (window.recycleWrap = ref); return window.recycleWrap; }}
                style={{ position: 'absolute', right: '20px', top: '10px' }}
            />
        </div>
    );
};

export default EditorContainer;
