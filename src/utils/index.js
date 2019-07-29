/* eslint-disable no-use-before-define */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-param-reassign */
import produce from 'immer';

let lang = 'en_US';

export function setLang(lg) {
    lang = lg;
}

export function getLang() {
    return lang;
}
export function getNodeById(node, id) {
    if (node.id === id) {
        return node;
    }
    if (node.children) {
        for (let i = 0; i < node.children.length; i += 1) {
            const nodeRes = getNodeById(node.children[i], id);
            if (nodeRes) {
                return nodeRes;
            }
        }
    }
    return null;
}
export function getParentNodeById(node, id) {
    if (!node.children) {
        return null;
    }
    if (node.children.find(x => x.id === id)) {
        return node;
    }
    for (let i = 0; i < node.children.length; i += 1) {
        const nodeRes = getParentNodeById(node.children[i], id);
        if (nodeRes) {
            return nodeRes;
        }
    }
    return null;
}

export function getPasteResultById(config, node, newIdFunc) {
    const copyResult = { node: {}, copyDetail: [] };
    const copydNode = node;
    const newIds = [];
    const processcopydNode = (node1) => {
        const prevId = node1.id;
        const nextId = newIdFunc(newIds);
        newIds.push(nextId);
        node1.id = nextId;
        copyResult.copyDetail.push({ from: prevId, to: nextId });
        if (node1.children) {
            for (let i = 0; i < node1.children.length; i += 1) {
                processcopydNode(node1.children[i]);
            }
        }
    };
    processcopydNode(copydNode);
    copyResult.node = copydNode;
    return copyResult;
}
export function getcopyResultById(config, id, newIdFunc) {
    const copyResult = { node: {}, copyDetail: [] };
    const sourceNode = getNodeById(config, id);
    const str = JSON.stringify(sourceNode);
    const copydNode = JSON.parse(str);
    const newIds = [];
    const processcopydNode = (node) => {
        const prevId = node.id;
        const nextId = newIdFunc(newIds);
        newIds.push(nextId);
        node.id = nextId;
        copyResult.copyDetail.push({ from: prevId, to: nextId });
        if (node.children) {
            for (let i = 0; i < node.children.length; i += 1) {
                processcopydNode(node.children[i]);
            }
        }
    };
    processcopydNode(copydNode);
    copyResult.node = copydNode;
    return copyResult;
}
/**
 *
 * @param {*} param0
 */
export function getNewFlowByAdd({
    config, node, containerId, containerIndex,
}) {
    const flow = produce(config, (draft) => {
        const containerNode = getNodeById(draft, containerId);
        if (containerNode.type === 'switch') {
            return;
        }
        if (!containerNode.children) {
            containerNode.children = [];
        }
        containerNode.children.splice(containerIndex, 0, node);
    });
    const nodes = getAllId(node);
    return { flow, nodes };
}

export function getAllId(node) {
    const ids = [];
    const pushId = (n) => {
        ids.push(n.id);
        if (n.children && n.children.length) {
            for (let i = 0; i < n.children.length; i += 1) {
                pushId(n.children[i]);
            }
        }
    };
    pushId(node);
    return ids;
}
/**
 *
 * @param {*} param0
 */
export function getNewFlowByDel({ config, sourceId }) {
    const nodes = [];
    const flow = produce(config, (draft) => {
        const sourceParentNode = getParentNodeById(draft, sourceId);
        const sourceIndex = sourceParentNode.children.findIndex(
            x => x.id === sourceId,
        );
        const sourceNode = sourceParentNode.children[sourceIndex];
        if (sourceNode.children && sourceNode.children.length) {
            const shouldDeleteNodeIds = getAllId(sourceNode);
            for (let i = 0; i < shouldDeleteNodeIds.length; i += 1) {
                nodes.push(shouldDeleteNodeIds[i]);
            }
        }
        sourceParentNode.children.splice(sourceIndex, 1);
        if (sourceNode.type === 'case' && !sourceParentNode.children.length) {
            const switchParentNode = getParentNodeById(draft, sourceParentNode.id);
            const switchIndex = switchParentNode.children.findIndex(
                x => x.id === sourceParentNode.id,
            );
            switchParentNode.children.splice(switchIndex, 1);
            nodes.push(sourceParentNode.id);
        }
    });
    return { flow, nodes };
}
export function getNewFlowByMove({
    config,
    sourceId,
    containerId,
    containerIndex,
}) {
    let nodes = [];
    const flow = produce(config, (draft) => {
        const sourceParentNode = getParentNodeById(draft, sourceId);
        const sourceIndex = sourceParentNode.children.findIndex(
            x => x.id === sourceId,
        );
        const sourceNode = sourceParentNode.children[sourceIndex];
        nodes = getAllId(sourceNode);
        const containerNode = getNodeById(draft, containerId);
        if (sourceNode.type === 'case' && containerNode.type !== 'switch') {
            return;
        }
        if (sourceNode.type !== 'case' && containerNode.type === 'switch') {
            return;
        }
        const newIndex = containerId === sourceParentNode.id && containerIndex > sourceIndex
            ? containerIndex - 1
            : containerIndex;
        sourceParentNode.children.splice(sourceIndex, 1);
        containerNode.children.splice(newIndex, 0, sourceNode);
        if (sourceNode.type === 'case' && !sourceParentNode.children.length) {
            const node = getParentNodeById(draft, sourceParentNode.id);
            const idnex = node.children.findIndex(x => x.id === sourceParentNode.id);
            node.children.splice(idnex, 1);
        }
    });
    return { flow, nodes };
}
/**
 *
 * @param {*} param0
 */
export function getNewFlowByPaste({
    config,
    sourceNode,
    containerId,
    containerIndex,
}) {
    let copyDetail = [];
    const data = produce(config, (draft) => {
        const containerNode = getNodeById(draft, containerId);
        const copyResult = getPasteResultById(
            config,
            sourceNode,
            getNewIdFunc(config),
        );
        copyDetail = copyResult.copyDetail;
        containerNode.children.splice(containerIndex, 0, copyResult.node);
    });
    return {
        data,
        copyDetail,
    };
}
/**
 *
 * @param {*} param0
 */
export function getNewFlowByCopy({
    config,
    sourceId,
    containerId,
    containerIndex,
}) {
    let copyDetail = [];
    const data = produce(config, (draft) => {
        const sourceParentNode = getParentNodeById(draft, sourceId);
        const sourceIndex = sourceParentNode.children.findIndex(
            x => x.id === sourceId,
        );
        const sourceNode = sourceParentNode.children[sourceIndex];
        const containerNode = getNodeById(draft, containerId);
        //
        if (sourceNode.type === 'case' && containerNode.type !== 'switch') {
            return;
        }
        if (sourceNode.type !== 'case' && containerNode.type === 'switch') {
            return;
        }
        const copyResult = getcopyResultById(
            config,
            sourceId,
            getNewIdFunc(config),
        );
        copyDetail = copyResult.copyDetail;
        containerNode.children.splice(containerIndex, 0, copyResult.node);
    });
    return {
        data,
        copyDetail,
    };
}

export function getNewNode(type = 'normal', node, newIdFunc) {
    const newIds = [];
    const id = newIdFunc(newIds);
    newIds.push(id);
    const newNode = {
        ...node,
        id,
        type,
    };
    if (type === 'loop') {
        newNode.type = 'loop';
        newNode.children = [];
    } else if (type === 'switch') {
        newNode.type = 'switch';
        const caseId1 = newIdFunc(newIds);
        newIds.push(caseId1);
        const caseId2 = newIdFunc(newIds);
        newIds.push(caseId2);
        newNode.children = [
            {
                id: caseId1,
                type: 'case',
                action: 'case',
                name: `case${caseId1}`,
                children: [],
            },
            {
                id: caseId2,
                type: 'case',
                action: 'case',
                name: `case${caseId2}`,
                children: [],
            },
        ];
    }
    return newNode;
}

/**
 *
 * @param {*} flow
 */
export const getNewIdFunc = (flow, prefix = '') => (ids) => {
    const prevIds = getAllId(flow);
    let id;
    let index = 0;
    do {
        index += 1;
        id = `${prefix}${index}`;
    } while (prevIds.includes(id) || ids.includes(id));
    return id;
};

/**
 *
 * @param {*} node
 */
export const getTitleOfNode = (node) => {
    let title = node.name;
    if (node.description) {
        try {
            const names = Object.keys(node);
            const vals = Object.values(node);
            title = new Function(...names, `return \`${node.description}\`;`)(...vals); // eslint-disable-line
        } catch (e) {
            console.error(e);
        }
    }
    return title;
};
