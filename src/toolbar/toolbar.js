import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './toolbar.scss';

const DRAG_IMAGE_DOM_ID = 'flow-icon-draged-image';

const handleDragStart = node => (e) => {
    e.dataTransfer.setData('type', node.type);
    e.dataTransfer.setData('node', JSON.stringify(node));
    e.dataTransfer.setData('nodeName', node.props.name);
    e.dataTransfer.setData('method', 'new');
    const dragImage = e.target.cloneNode();
    dragImage.innerHTML = node.props.name;
    dragImage.style.width = '150px';
    dragImage.style.height = '23px';
    dragImage.style.display = 'block';
    dragImage.style.border = '1px solid black';
    dragImage.style.backgroundColor = 'lightyellow';
    dragImage.style.textAlign = 'center';
    dragImage.id = DRAG_IMAGE_DOM_ID;
    document.body.append(dragImage);
    dragImage.style.position = 'absolute';
    dragImage.style.left = '-100px';
    dragImage.style.top = '-100px';
    e.dataTransfer.setDragImage(dragImage, 10, 10);
};

const handleDragEnd = () => {
    const dragImage = document.getElementById(DRAG_IMAGE_DOM_ID);
    if (dragImage) {
        document.body.removeChild(dragImage);
    }
};

const toolbar = ({ template, width, iconWritingMode }) => {
    const {
        nodes,
        entities: { node: nodeEntity },
    } = template;
    const tools = nodes.filter(x => nodeEntity[x].props.showInToolbar === 'Y');
    return (
        <div
            className="flow-icon-toolbar react-workflow-toobar-container"
            style={{ width: `${width}px`, writingMode: iconWritingMode }}
        >
            {tools.map(x => (
                <div
                    className="icon-wrap"
                    key={x}
                    title={nodeEntity[x].name}
                    draggable="true"
                    onDragStart={handleDragStart(nodeEntity[x])}
                    onDragEnd={handleDragEnd}
                >
                    <div className="icon">
                        {
                            typeof nodeEntity[x].icon === 'string' ? <FontAwesomeIcon icon={nodeEntity[x].icon} className={nodeEntity[x].className} /> : nodeEntity[x].icon
                        }
                    </div>
                </div>
            ))}
        </div>
    );
};

toolbar.propsType = {
    template: PropTypes.object,
};

export default toolbar;
