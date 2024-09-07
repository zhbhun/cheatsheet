import { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { ControlledTreeEnvironment, Tree, TreeItem } from 'react-complex-tree';
import 'react-complex-tree/lib/style-modern.css';
import { loadLanguage, Outline } from '@/data';
import { usePresetStore } from '@/store';

type OutlineTreeItem = TreeItem<{
  id: string;
  key: string;
  title: string;
}>;

const convertToTreeItems = (
  nodes: Outline[]
): Record<string, OutlineTreeItem> => {
  const treeItems: Record<string, OutlineTreeItem> = {};
  const addItem = (node: Outline, parents: string[]) => {
    const { id, title, children } = node;
    const ids = [...parents, id];
    const key = ids.join('/');
    treeItems[key] = {
      index: key,
      children: children
        ? children.map((child) => [...ids, child.id].join('/'))
        : [],
      isFolder: !!children,
      canMove: false,
      canRename: false,
      data: {
        id: id,
        key: key,
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
  const { language } = usePresetStore();
  const [treeData, setTreeData] = useState<Record<string, TreeItem>>({});
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
          onExpandItem={(item) => {
            setExpandedItems((prev) => {
              return prev.includes(item.index as string)
                ? prev.filter((id) => id !== item.index)
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
