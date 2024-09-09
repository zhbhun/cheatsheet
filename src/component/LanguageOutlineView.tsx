import { useEffect, useState } from 'react';
import { ControlledTreeEnvironment, Tree, TreeItem } from 'react-complex-tree';
import 'react-complex-tree/lib/style-modern.css';
import { loadLanguage, LanguageOutline } from '@/language';

type OutlineTreeItem = TreeItem<{
  id: string;
  index: string;
  parentIndex: string;
  title: string;
}>;

const convertToTreeItems = (
  nodes: LanguageOutline[]
): Record<string, OutlineTreeItem> => {
  const treeItems: Record<string, OutlineTreeItem> = {};
  const addItem = (node: LanguageOutline, parents: string[]) => {
    const { id, title, children } = node;
    const ids = [...parents, id];
    const index = ids.join('/');
    const parentIndex = parents.join('/');
    treeItems[index] = {
      index: index,
      children: children
        ? children.map((child) => [...ids, child.id].join('/'))
        : [],
      isFolder: !!children,
      canMove: false,
      canRename: false,
      data: {
        id: id,
        index,
        parentIndex,
        title,
      },
    };
    if (children) {
      children.forEach((child) => addItem(child, ids));
    }
  };
  nodes.forEach((node) => addItem(node, []));
  return treeItems;
};

export interface LanguageOutlineProps {
  language: string;
  selected: string;
  onNavigate?: (index: string) => void;
}

export function LanguageOutlineView({
  language,
  selected,
  onNavigate,
}: LanguageOutlineProps) {
  const [treeData, setTreeData] = useState<Record<string, OutlineTreeItem>>({});
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  useEffect(() => {
    if (language) {
      loadLanguage(language).then((data) => {
        setTreeData(
          convertToTreeItems([
            {
              id: data.id,
              title: data.title,
              children: data.outlines,
            } as LanguageOutline,
          ])
        );
      });
    }
  }, [language]);
  useEffect(() => {
    const key = selected;
    if (treeData[key]) {
      setSelectedItems([key]);
      setExpandedItems((prev) => {
        let index = key;
        let newIndexes = prev;
        while (index && treeData[index]) {
          const record = treeData[index];
          if (record && record.isFolder) {
            newIndexes = newIndexes.includes(index)
              ? newIndexes
              : [...newIndexes, index];
          }
          index = record.data.parentIndex;
        }
        return newIndexes;
      });
      setTimeout(() => {
        const element = document.querySelector(
          `button[data-rct-item-id="${key}"]`
        ) as any;
        if (element?.scrollIntoViewIfNeeded) {
          element.scrollIntoViewIfNeeded();
        } else if (element?.scrollIntoView) {
          element.scrollIntoView();
        }
      }, 0);
    }
  }, [treeData, selected]);
  return (
    <ControlledTreeEnvironment
      items={treeData}
      viewState={{
        outline: {
          selectedItems: selectedItems,
          expandedItems: expandedItems,
        },
      }}
      getItemTitle={(item) => item.data?.title ?? ''}
      canDragAndDrop={false}
      canDropOnFolder={false}
      canReorderItems={false}
      canRename={false}
      onCollapseItem={(item) => {
        setExpandedItems((prev) => {
          return prev.includes(item.index as string)
            ? prev.filter((id) => id !== item.index)
            : prev;
        });
      }}
      onExpandItem={(item) => {
        setExpandedItems((prev) => {
          return prev.includes(item.index as string)
            ? prev
            : [...prev, item.index as string];
        });
      }}
      onSelectItems={(itemIndexes) => {
        const selectedIndex = itemIndexes[0] as string;
        const selectedItem = treeData[selectedIndex];
        if ((selectedItem.children?.length ?? 0) > 0) {
          return;
        }
        const previousSelectedIndex = selectedItems[0];
        if (selectedIndex !== previousSelectedIndex) {
          if (selectedIndex) {
            setSelectedItems([selectedIndex]);
            onNavigate?.(selectedIndex);
          } else {
            setSelectedItems([]);
          }
        }
      }}
    >
      <Tree treeId="outline" rootItem={language} treeLabel="Outline" />
    </ControlledTreeEnvironment>
  );
}

export default LanguageOutlineView;
