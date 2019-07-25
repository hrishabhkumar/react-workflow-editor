
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
    const [height, setHeight] = useState(0);
    const [width, setWidth] = useState(iconSize + toolbarPadding);
    const containerRef = useRef();

    useEffect(() => {
        if (containerRef && containerRef.current.offsetHeight !== height) {
            const {
                nodes,
                entities: { node: nodeEntity },
            } = template;
            const finalNodes = [].concat(...Object.values(nodes));
            const tools = finalNodes.filter(x => nodeEntity[x].props.showInToolbar === 'Y');
            const count = tools.length;
            const rows = Math.floor(
                (containerRef.current.offsetHeight - toolbarPadding * 2) / iconSize,
            );
            const columns = Math.ceil(count / rows);
            const newWidth = columns * iconSize;
            setWidth(newWidth);
            setHeight(containerRef.current.offsetHeight);
        }
    });

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
                    width={width}
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
