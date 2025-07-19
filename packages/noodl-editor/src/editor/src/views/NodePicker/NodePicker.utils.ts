import { INodeType } from '@noodl-types/nodeTypes';
import { ComponentModel } from '@noodl-models/componentmodel';
import { NodeGraphModel, NodeGraphNode } from '@noodl-models/nodegraphmodel';
import { INodeIndexCategory } from '@noodl-utils/createnodeindex';
import { guid } from '@noodl-utils/utils';

// ADD THIS IMPORT

import { CommentFillStyle } from '../CommentLayer/CommentLayerView';

export function parseNodeObject(nodeTypes: TSFixme[], model: TSFixme, parentModel: TSFixme) {
  const resultTree: INodeIndexCategory[] = [];

  for (const i in nodeTypes) {
    const nodeType = nodeTypes[i];

    // Check if node can be created with the current parent
    const status = model.owner.getCreateStatus({
      parent: parentModel,
      type: nodeType
    });

    if (!status.creatable) continue;

    // Add to result if allowed, build the tree if necessary
    let currentCategoryInTree = resultTree?.find((item) => item.name === nodeType.category);

    if (!currentCategoryInTree) {
      resultTree.push({
        name: nodeType.category,
        type: nodeType.color,
        description: 'TODO',
        subCategories: [],
        items: []
      });

      currentCategoryInTree = resultTree.find((item) => item.name === nodeType.category);
    }

    let currentSubCategoryInTree = currentCategoryInTree?.subCategories?.find(
      (subCategory) => subCategory.name === nodeType?.subCategory
    );

    if (typeof nodeType.subCategory !== 'undefined') {
      if (!currentSubCategoryInTree) {
        currentCategoryInTree.subCategories.push({
          name: nodeType.subCategory,
          items: []
        });

        currentSubCategoryInTree = currentCategoryInTree.subCategories?.find(
          (subCategory) => subCategory.name === nodeType?.subCategory
        );
      }

      currentSubCategoryInTree.items.push(nodeType);
    } else {
      currentCategoryInTree.items.push(nodeType);
    }
  }

  return resultTree;
}

export function createNodeFunction(
  model: NodeGraphModel,
  parentModelFromPicker: NodeGraphNode,
  pos: { x: number; y: number },
  attachToRoot: boolean,
  selectedNodeId?: string
) {
  // --- CHANGE 2: Update the parameter type from ComponentModel to INodeType ---
  return function (type: INodeType) {
    const newNode = NodeGraphNode.fromJSON({
      type: type.name,
      x: pos.x,
      y: pos.y,
      id: guid()
    });

    // If a node is selected in the viewer, use smart placement logic
    if (selectedNodeId) {
      const selectedNode = model.findNodeWithId(selectedNodeId);
      if (selectedNode) {
        // Rule 1: Try to add as a child
        if (selectedNode.canAcceptChildren([newNode])) {
          selectedNode.addChild(newNode, { undo: true, label: 'create child' });
          return;
        }

        // Rule 2: If it can't be a child, add as a sibling
        if (selectedNode.parent) {
          selectedNode.parent.addChild(newNode, { undo: true, label: 'create sibling' });
          return;
        }
      }
    }

    // Rule 3 (Fallback): Use the original logic if no node is selected
    // or if the selected node was invalid.
    if (parentModelFromPicker && !attachToRoot) {
      parentModelFromPicker.addChild(newNode, { undo: true, label: 'create' });
    } else {
      model.addRoot(newNode, { undo: true, label: 'create' });
    }
  };
}

export function createNewComment(model: TSFixme, pos: TSFixme) {
  const comment = {
    text: '',
    width: 150,
    height: 100,
    fill: CommentFillStyle.Transparent,
    x: pos.x,
    y: pos.y
  };

  model.commentsModel.addComment(comment, { undo: true, label: 'add comment', focusComment: true });
}
