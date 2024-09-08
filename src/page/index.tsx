import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ControlledTreeEnvironment, Tree, TreeItem } from 'react-complex-tree';
import 'react-complex-tree/lib/style-modern.css';
import { loadLanguage, Outline } from '@/data';
import { usePresetStore } from '@/store';

type OutlineTreeItem = TreeItem<{
  id: string;
  index: string;
  parentIndex: string;
  title: string;
}>;

const convertToTreeItems = (
  nodes: Outline[]
): Record<string, OutlineTreeItem> => {
  const treeItems: Record<string, OutlineTreeItem> = {};
  const addItem = (node: Outline, parents: string[]) => {
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

export function Layout() {
  const navigate = useNavigate();
  const localtion = useLocation();
  const { language } = usePresetStore();
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
            } as Outline,
          ])
        );
      });
    }
  }, [language]);
  useEffect(() => {
    const key = localtion.pathname.substring(1);
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
        const matchedItemElement = document.querySelector(
          `button[data-rct-item-id="${key}"]`
        );
        matchedItemElement?.scrollIntoView();
      }, 0);
    }
  }, [treeData, localtion]);
  return (
    <div className="pl-[300px]">
      <div className="fixed top-0 left-0 bottom-0 w-[300px] py-1 border-r border-neutral-100 overflow-y-auto">
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
                navigate(selectedIndex);
              } else {
                setSelectedItems([]);
              }
            }
          }}
        >
          <Tree treeId="outline" rootItem={language} treeLabel="Outline" />
        </ControlledTreeEnvironment>
      </div>
      <Outlet />
    </div>
  );
}

export default Layout;
