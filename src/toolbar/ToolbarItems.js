import React, { useState } from 'react';
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

const ToolbarItems = ({ tools, nodeEntity, group }) => {
    const [open, setOpen] = useState(false);
    const [className, setClassName] = useState('accordion-content accordion-close');
    const [caretClass, setCaretClass] = useState('caret-right');
    const [headingClassName, setHeadingClassName] = useState('accordion-heading');
    const handleClick = () => {
        if (open) {
            setOpen(false);
            setClassName('accordion-content accordion-close');
            setHeadingClassName('accordion-heading');
            setCaretClass('caret-right');
        } else {
            setOpen(true);
            setClassName('accordion-content accordion-open');
            setHeadingClassName('accordion-heading clicked');
            setCaretClass('caret-down');
        }
    };
    return (
        <div className="parent-accordion">
            {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
            <div className={headingClassName} onClick={handleClick}>
                <FontAwesomeIcon icon={caretClass} /> {group}
            </div>
            <div className={className}>
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
                        <span className="flow-name">{nodeEntity[x].props.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

ToolbarItems.propsType = {
    template: PropTypes.object,
};

export default ToolbarItems;
