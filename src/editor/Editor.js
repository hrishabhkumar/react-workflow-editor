/* eslint-disable jsx-a11y/no-static-element-interactions */
import PropTypes from 'prop-types';
import React, {
    useState, useEffect, useRef,
} from 'react';
import { createPortal } from 'react-dom';
import { History } from 'stateshot';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    getNewFlowByAdd,
    getNewFlowByCopy,
    getNewFlowByPaste,
    getNewFlowByDel,
    getNewFlowByMove,
    getNewIdFunc,
    getNewNode,
    getNodeById,
    getParentNodeById,
} from '../utils';
import Recycle from './recycle';
import './editor.scss';

const COLLAPSE_STATE_ID_PREFIX = 'collapse-state-id-';

const getDataFromProps = (_data) => {
    if (!_data) {
        return { id: 'root', children: [] };
    }
    if (!_data.children) {
        return {
            ..._data,
            children: [],
        };
    }
    return _data;
};

const Editor = (props, ref) => {
    const workflowRef = useRef();

    const [data, setData] = useState(null);
    const [prevData, setPrevData] = useState(null);
    const [dataFromProps, setDataFromProps] = useState(null);
    const [currentId, setCurrentId] = useState(null);
    const [collapseStateIds, setCollapseStateIds] = useState({});
    const [dragId, setDragId] = useState(null);
    const [isDragCase, setIsDragCase] = useState(false);
    const [containerId, setContainerId] = useState(null);
    const [containerIndex, setContainerIndex] = useState(null);
    const [history] = useState(() => {
        const initialHisory = new History();
        initialHisory.pushSync(getDataFromProps());
        return initialHisory;
    });

    const newData = getDataFromProps(props.data);
    const dataString = JSON.stringify(newData);

    if (!prevData || dataFromProps !== prevData) {
        setPrevData(dataFromProps);
        setDataFromProps(dataString);
        setData(newData);
    }

    const handleUpdateData = (updatedData) => {
        setData({ ...updatedData });
        history.pushSync(updatedData);
    };

    const handleClearState = () => {
        setContainerId(null);
        setContainerIndex(null);
        setDragId(null);
        setIsDragCase(false);
    };

    const handleKeyUp = (event) => {
        if (event.key === 'Delete') {
            if (!currentId) {
                return;
            }
            const sourceParentNode = getParentNodeById(data, currentId);
            const sourceIndex = sourceParentNode.children.findIndex(
                x => x.id === currentId,
            );
            const { flow, nodes } = getNewFlowByDel({
                config: data,
                sourceId: currentId,
            });
            if (props.onChange && typeof props.onChange === 'function') {
                props.onChange({
                    data: flow,
                    detail: {
                        action: 'del',
                        position: { id: sourceParentNode.id, index: sourceIndex },
                        nodes,
                    },
                });
            }
            handleClearState();
            setCurrentId(null);
            handleUpdateData(flow);
            return;
        }
        if (event.ctrlKey) {
            switch (event.key) {
                case 'z':
                    (() => {
                        const undoneData = history.undo().get();
                        setData(undoneData);
                        if (
                            props.onChange
              && typeof props.onChange === 'function'
                        ) {
                            props.onChange({
                                data,
                                detail: {
                                    action: 'undo',
                                },
                            });
                        }
                    })();
                    break;
                case 'y':
                    (() => {
                        const redoData = history.redo().get();
                        setData(redoData);
                        if (
                            props.onChange
              && typeof props.onChange === 'function'
                        ) {
                            props.onChange({
                                data,
                                detail: {
                                    action: 'undo',
                                },
                            });
                        }
                    })();
                    break;
                default:
                    break;
            }
        }
    };

    const handleCopy = (event) => {
        const node = getNodeById(data, currentId);
        const text = JSON.stringify(node);
        if (text) {
            event.clipboardData.setData('text/plain', `react-workflow-editor:${text}`);
        }
        event.preventDefault();
    };

    const handlePaste = (event) => {
        const { clipboardData } = event;
        if (!(clipboardData && clipboardData.items)) {
            return;
        }
        const text = clipboardData.getData('text/plain');
        if (text.startsWith('react-workflow-editor:')) {
            const nodeStr = text.substring('react-workflow-editor:'.length);
            const node = (() => {
                try {
                    const value = JSON.parse(nodeStr);
                    return value;
                } catch (e) {
                    return null;
                }
            })();
            if (!node) {
                return;
            }
            const { containerId: containerId1, containerIndex: containerIndex1 } = (() => {
                const unPasteResult = { containerId: null, containerIndex: null };
                if (!currentId && node.type !== 'case') {
                    return {
                        containerId: 'root',
                        containerIndex: data.children.length,
                    };
                }
                const currentNode = getNodeById(data, currentId);
                if (
                    (currentNode.type === 'loop' && node.type !== 'case')
          || (currentNode.type === 'case' && node.type !== 'case')
          || (currentNode.type === 'switch' && node.type === 'case')
                ) {
                    return {
                        containerId: currentId,
                        containerIndex: currentNode.children.length,
                    };
                }
                if (node.type === 'case' && currentNode.type !== 'case') {
                    return unPasteResult;
                }
                const containerNode = getParentNodeById(data, currentId);
                const containerIndex2 = 1 + containerNode.children.findIndex(x => x.id === currentId);
                return { containerId: containerNode.id, containerIndex: containerIndex2 };
            })();
            if (!containerId1) {
                return;
            }
            const { data: updatedData, copyDetail } = getNewFlowByPaste({
                config: data,
                sourceNode: node,
                containerId: containerId1,
                containerIndex: containerIndex1,
            });
            const sourceParentNode = getParentNodeById(updatedData, node.id);
            const sourceIndex = sourceParentNode.children.findIndex(
                x => x.id === node.id,
            );
            if (props.onChange && typeof props.onChange === 'function') {
                props.onChange({
                    data: updatedData,
                    detail: {
                        action: 'paste',
                        position: { id: sourceParentNode.id, index: sourceIndex },
                        position2: { id: containerId, index: containerIndex },
                        nodes: copyDetail.map(x => x.from),
                        nodes2: copyDetail.map(x => x.to),
                    },
                });
            }
            handleClearState();
            handleUpdateData(updatedData);
        }
    };

    useEffect(() => {
        document.addEventListener('copy', handleCopy);
        document.addEventListener('paste', handlePaste);
        document.addEventListener('keyup', handleKeyUp);
        return () => {
            document.removeEventListener('copy', handleCopy);
            document.removeEventListener('paste', handlePaste);
            document.removeEventListener('keyup', handleKeyUp);
        };
    });

    const handleClick = id => (e) => {
        e.stopPropagation();
        setCurrentId(id);
        if (props.onClick && typeof props.onClick === 'function') {
            props.onClick(id);
        }
    };

    const handleClickExpandIcon = id => (e) => {
        e.stopPropagation();
        const stateId = `${COLLAPSE_STATE_ID_PREFIX}${id}`;
        setCollapseStateIds({
            ...collapseStateIds,
            [stateId]: !collapseStateIds[stateId],
        });
    };

    const handleDragStart = id => (e) => {
        e.dataTransfer.setData('dragId', id);
        e.dataTransfer.setDragImage(e.target, 10, 10);
        e.stopPropagation();
        const dragNode = getNodeById(data, id);
        setDragId(id);
        setIsDragCase(dragNode.type === 'case');
    };

    const handleDragOver = ({ containerId: currentContainerId, containerIndex: currentContainerIndex }) => (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (currentContainerId !== containerId || currentContainerIndex !== containerIndex) {
            setContainerId(currentContainerId);
            setContainerIndex(currentContainerIndex);
        }
    };

    const handleDragLeave = ({ containerId: currentContainerId, containerIndex: currentContainerIndex }) => (e) => {
        e.stopPropagation();
        if (currentContainerId === containerId && currentContainerIndex === containerIndex) {
            setContainerId(null);
            setContainerIndex(null);
        }
    };

    const handleDrop = (e) => {
        e.stopPropagation();
        const sourceId = e.dataTransfer.getData('dragId');
        const nodeName = e.dataTransfer.getData('nodeName');
        const method = e.dataTransfer.getData('method');
        if (method === 'new' && containerId === 'recycle') {
            handleClearState();
            return;
        }
        if (method === 'new') {
            let node = JSON.parse(e.dataTransfer.getData('node'));
            const type = e.dataTransfer.getData('type');
            node = getNewNode(
                type,
                node.props.action,
                node.props.name,
                getNewIdFunc(data),
            );
            const { flow, nodes } = getNewFlowByAdd({
                config: data,
                node,
                containerId,
                containerIndex,
            });
            if (props.onChange && typeof props.onChange === 'function') {
                props.onChange({
                    data: flow,
                    detail: {
                        action: 'add',
                        position: { id: containerId, index: containerIndex },
                        nodes,
                    },
                });
            }
            handleClearState();
            handleUpdateData(flow);
            return;
        }
        const sourceParentNode = getParentNodeById(data, sourceId);
        const sourceIndex = sourceParentNode.children.findIndex(
            x => x.id === sourceId,
        );
        if (containerId === 'recycle') {
            const { flow, nodes } = getNewFlowByDel({
                config: data,
                sourceId,
            });
            if (props.onChange && typeof props.onChange === 'function') {
                props.onChange({
                    data: flow,
                    detail: {
                        action: 'del',
                        position: { id: sourceParentNode.id, index: sourceIndex },
                        nodes,
                    },
                });
            }
            handleClearState();
            setContainerId(null);
            handleUpdateData(flow);
            return;
        }
        const action = e.nativeEvent.ctrlKey || e.nativeEvent.metaKey ? 'copy' : 'move';

        if (action === 'move') {
            if (
                sourceParentNode.id === containerId
        && (containerIndex === sourceIndex || containerIndex === sourceIndex + 1)
            ) {
                handleClearState();
                return;
            }
        }
        if (action === 'copy') {
            const { data: data1, copyDetail } = getNewFlowByCopy({
                config: data,
                sourceId,
                containerId,
                containerIndex,
            });
            if (props.onChange && typeof props.onChange === 'function') {
                props.onChange({
                    data: data1,
                    detail: {
                        action: 'copy',
                        position: { id: sourceParentNode.id, index: sourceIndex },
                        position2: { id: containerId, index: containerIndex },
                        nodes: copyDetail.map(x => x.from),
                        nodes2: copyDetail.map(x => x.to),
                    },
                });
            }
            handleClearState();
            handleUpdateData(data1);
            return;
        } if (action === 'move') {
            const { flow, nodes } = getNewFlowByMove({
                config: data,
                sourceId,
                containerId,
                containerIndex,
            });
            if (flow === data) {
                handleClearState();
                return;
            }
            if (props.onChange && typeof props.onChange === 'function') {
                props.onChange({
                    data: flow,
                    detail: {
                        action: 'move',
                        position: { id: sourceParentNode.id, index: sourceIndex },
                        position2: { id: containerId, index: containerIndex },
                        nodes,
                    },
                });
            }
            handleClearState();
            handleUpdateData(flow);
        }
    };

    const renderLine = ({
        containerId: currentContainerId, containerIndex: currentContainerIndex, hasArrow, style,
    }) => {
        const arrowClassName = hasArrow ? 'arrow-line' : '';
        const dragoverClassName = currentContainerId === containerId && currentContainerIndex === containerIndex ? 'dragover' : '';
        return (
            <div
                className={`flow-line ${arrowClassName} ${dragoverClassName}`}
                key={`line-${containerId}:{containerIndex}`}
                style={style}
                onDragOver={handleDragOver({ containerId: currentContainerId, containerIndex: currentContainerIndex })}
                onDragLeave={handleDragLeave({ containerId: currentContainerId, containerIndex: currentContainerIndex })}
                onDrop={handleDrop}
            >
                <div className="line" />
                <div className="rect" />
                <div className="line" />
                {hasArrow && <div className="arrow" />}
            </div>
        );
    };

    const renderHalfHeightLine = () => (
        <div className="flow-line">
            <div className="line" />
        </div>
    );

    const renderNode = (node) => {
        const collapseState = collapseStateIds[`${COLLAPSE_STATE_ID_PREFIX}${node.id}`];
        if (node.type === 'loop') {
            return (
                <div
                    key={node.id}
                    onClick={handleClick(node.id)}
                    className={`${collapseState ? 'collapse' : ''} workflow-node loop ${
                        dragId === node.id ? 'draged' : ''
                    } ${currentId === node.id ? 'clicked' : ''}`}
                    draggable="true"
                    onDragStart={handleDragStart(node.id)}
                >
                    <div className="title" onClick={handleClickExpandIcon(node.id)}>
                        <div>
                            <FontAwesomeIcon icon="plus-square" className="expand-icon" />
                            <FontAwesomeIcon icon="minus-square" className="collapse-icon" />
                            <span style={{ verticalAlign: 'top' }}>{node.name || node.type}</span>
                            <FontAwesomeIcon
                                icon="undo"
                                style={{
                                    width: '18px',
                                    height: '18px',
                                    marginLeft: '4px',
                                    marginTop: '2px',
                                }}
                            />
                        </div>
                    </div>
                    {renderLine({ containerId: node.id, containerIndex: 0 })}
                    <div className="workflow-body">
                        {node.children.map((x, index) => [
                            renderNode(x),
                            renderLine({
                                containerId: node.id,
                                containerIndex: index + 1,
                                hasArrow: true,
                            }),
                        ])}
                    </div>
                </div>
            );
        } if (node.type === 'switch') {
            return (
                <div
                    key={node.id}
                    className={`${collapseState ? 'collapse' : ''} workflow-node switch ${
                        dragId === node.id ? 'draged' : ''
                    } ${currentId === node.id ? 'clicked' : ''}`}
                    draggable="true"
                    onClick={handleClick(node.id)}
                    onDragStart={handleDragStart(node.id)}
                >
                    <div className="title" onClick={handleClickExpandIcon(node.id)}>
                        <div>
                            <FontAwesomeIcon icon="plus-square" className="expand-icon" />
                            <FontAwesomeIcon icon="minus-square" className="collapse-icon" />
                            <span style={{ verticalAlign: 'top' }}>{node.name || node.type}</span>
                            <FontAwesomeIcon
                                icon="sitemap"
                                alt="switch"
                                style={{
                                    width: '18px',
                                    height: '18px',
                                    marginLeft: '4px',
                                    marginTop: '3px',
                                }}
                            />
                        </div>
                    </div>
                    {renderHalfHeightLine()}
                    <div className="switch-body">
                        {node.children.map((x, index) => [
                            <div className="workflow-node case" key={`workflow-node-${x.id}`}>
                                <div className="workflow-node-line-up">
                                    <div className="line left-div" />
                                    <div className="line right-div" />
                                </div>
                                <div className="workflow-node-rect-wrap">
                                    <div
                                        className={`workflow-node-rect ${
                                            dragId === x.id ? 'draged' : ''
                                        } ${currentId === x.id ? 'clicked' : ''}`}
                                        draggable="true"
                                        onClick={handleClick(x.id)}
                                        onDragStart={handleDragStart(x.id)}
                                        onDragOver={handleDragOver({
                                            containerId: node.id,
                                            containerIndex: index + 1,
                                            id: x.id,
                                        })}
                                        onDragLeave={handleDragLeave({
                                            containerId: node.id,
                                            containerIndex: index + 1,
                                        })}
                                        onDrop={handleDrop}
                                    >
                                        <div className="title">
                                            <div>{x.name}</div>
                                            <FontAwesomeIcon
                                                icon="bars"
                                                style={{ width: '18px', height: '18px' }}
                                            />
                                        </div>
                                        {renderLine({
                                            containerId: x.id,
                                            containerIndex: 0,
                                            style: {
                                                flexGrow: x.children && x.children.length ? 0 : 1,
                                            },
                                        })}
                                        <div className="workflow-body">
                                            {x.children
                        && x.children.map((y, yIndex) => [
                            renderNode(y),
                            renderLine({
                                containerId: x.id,
                                containerIndex: yIndex + 1,
                                hasArrow: true,
                            }),
                        ])}
                                        </div>
                                    </div>
                                    {containerId === node.id
                    && containerIndex === index + 1
                    && isDragCase
                    && dragId !== x.id && (
                                        <div className="insert-rect-space" />
                                    )}
                                </div>
                                <div className="workflow-node-line-down">
                                    <div className="line left-div" />
                                    <div className="line right-div" />
                                </div>
                            </div>,
                        ])}
                    </div>
                    {renderHalfHeightLine()}
                </div>
            );
        }
        const color = '#ccc';
        return (
            <div
                key={node.id}
                className={`workflow-node normal ${
                    dragId === node.id ? 'draged' : ''
                } ${currentId === node.id ? 'clicked' : ''}`}
                style={{
                    backgroundColor: color,
                    boxShadow: `0 0 0 2px white, 0 0 0 3px ${color}`,
                }}
                onClick={handleClick(node.id)}
                draggable="true"
                onDragStart={handleDragStart(node.id)}
            >
                {node.name || 'Node'}
            </div>
        );
    };
    if (!data) {
        return null;
    }
    return (
        <div
            className="react-workflow-editor-wrap react-workflow-editor-container editor"
            style={props.style || {}}
            ref={workflowRef}
            // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
            tabIndex={0}
            onClick={handleClearState}
        >
            {window.recycleWrap
          && createPortal(
              <Recycle
                  visible={!!dragId}
                  onDragOver={handleDragOver({
                      containerId: 'recycle',
                      containerIndex: null,
                  })}
                  onDragLeave={handleDragLeave({
                      containerId: 'recycle',
                      containerIndex: null,
                  })}
                  onDrop={handleDrop}
              />,
              window.recycleWrap,
          )}
            <div className="main-workflow-theme">
                <div className="workflow-body root">
                    <div className="node-start">
                        <FontAwesomeIcon
                            icon="play-circle"
                            style={{ width: '32px', height: '32px' }}
                        />
                    </div>
                    {renderLine({ containerId: 'root', containerIndex: 0 })}
                    {data.children.map((x, index) => {
                        const hasArrow = index !== data.children.length - 1;

                        return [
                            renderNode(x),
                            renderLine({
                                containerId: 'root',
                                containerIndex: index + 1,
                                hasArrow,
                            }),
                        ];
                    })}
                    <div className="node-end">
                        <FontAwesomeIcon
                            icon="stop-circle"
                            style={{ width: '32px', height: '32px' }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

Editor.propTypes = {
    data: PropTypes.shape({
        id: PropTypes.string,
        children: PropTypes.array,
    }),
    template: PropTypes.object,
    theme: PropTypes.string,
    style: PropTypes.object,
    onClick: PropTypes.func,
    onChange: PropTypes.func,
};
export default Editor;
