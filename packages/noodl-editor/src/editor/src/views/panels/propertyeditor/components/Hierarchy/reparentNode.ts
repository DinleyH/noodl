import { NodeGraphNode } from '@noodl-models/nodegraphmodel';
import { UndoQueue, UndoActionGroup } from '@noodl-models/undo-queue-model';

/**
 * Moves a node to a new parent, updating the hierarchy and creating a robust undo action.
 * @param nodeToMove The node that will be moved.
 * @param newParent The new parent for the node.
 */
export function reparentNode(nodeToMove: NodeGraphNode, newParent: NodeGraphNode) {
  const oldParent = nodeToMove.parent;
  const graph = nodeToMove.owner; // This is the NodeGraphModel instance

  // Basic validation to prevent errors
  if (!graph || !oldParent || !newParent || nodeToMove.owner !== newParent.owner) {
    console.error('Cannot reparent node: invalid parameters.');
    return;
  }

  const oldIndex = oldParent.children.indexOf(nodeToMove);
  if (oldIndex === -1) {
    console.error('Node to move not found in its parent.');
    return;
  }

  // Create the undo group that will contain our action
  const undoGroup = new UndoActionGroup({ label: 'Change Node Hierarchy' });

  // Use pushAndDo to add the action to the group AND execute it immediately
  undoGroup.pushAndDo({
    // The 'do' action is what happens when the user first performs the action (or redoes it)
    do: () => {
      // 1. Remove node from its old parent's children array
      const index = oldParent.children.indexOf(nodeToMove);
      if (index !== -1) {
        oldParent.children.splice(index, 1);
      }

      // 2. Add it to the new parent
      newParent.children.push(nodeToMove);
      nodeToMove.parent = newParent; // Directly assign the parent

      // 3. Notify the editor so the UI updates
      graph.notifyListeners('nodeDetached', { model: nodeToMove, oldParent: oldParent });
      graph.notifyListeners('nodeAttached', {
        model: nodeToMove,
        parent: newParent,
        index: newParent.children.length - 1
      });
    },
    // The 'undo' action is what happens when the user presses Ctrl/Cmd+Z
    undo: () => {
      // 1. Remove the node from its new parent
      const newIndex = newParent.children.indexOf(nodeToMove);
      if (newIndex !== -1) {
        newParent.children.splice(newIndex, 1);
      }

      // 2. Add it back to the old parent at the correct position
      oldParent.children.splice(oldIndex, 0, nodeToMove);
      nodeToMove.parent = oldParent; // Directly assign the parent back

      // 3. Notify the editor so the UI updates
      graph.notifyListeners('nodeDetached', { model: nodeToMove, oldParent: newParent });
      graph.notifyListeners('nodeAttached', { model: nodeToMove, parent: oldParent, index: oldIndex });
    }
  });

  // Add the entire action to the global undo queue
  UndoQueue.instance.push(undoGroup);
}
