import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ToolbarItems from './ToolbarItems';

const Toolbar = ({ template, width, iconWritingMode }) => {
    const {
        nodes,
        entities: { node: nodeEntity },
    } = template;
    const groups = Object.keys(nodes);

    return (
        <div
            className="flow-icon-toolbar react-workflow-toobar-container"
            style={{ writingMode: iconWritingMode }}
        >
            {
                groups.map((group) => {
                    const tools = nodes[group].children.filter(x => nodeEntity[x].showInToolbar !== 'N');
                    return (
                        <ToolbarItems
                            tools={tools}
                            nodeEntity={nodeEntity}
                            key={`toobar-group-${group}`}
                            group={group}
                            groupIcon={nodes[group].icon}
                        />

                    );
                })
            }
        </div>
    );
};

Toolbar.propsType = {
    template: PropTypes.object,
};

export default Toolbar;
