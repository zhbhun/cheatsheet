import clsx from 'clsx';
import { ReactNode, useEffect, useState } from 'react';
import { Ellipsis, PanelLeftClose } from 'lucide-react';
import {
  Breadcrumbs,
  BreadcrumbItem,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  ScrollShadow,
} from '@nextui-org/react';
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

export interface FeatureWrapperProps {
  language: string;
  feature: string;
  children: ReactNode;
  onSwitch?: (index: string) => void;
}

export function FeatureWrapper({
  language,
  feature,
  children,
  onSwitch,
}: FeatureWrapperProps) {
  const [collapsed, setCollapsed] = useState(false);
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
    const key = feature;
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
  }, [treeData, feature]);
  return (
    <div
      className={clsx('pt-11 pl-64 duration-300 ease-in-out', {
        '!pl-0': collapsed,
      })}
    >
      <div
        className={clsx(
          'fixed top-0 left-0 bottom-0 w-64 bg-neutral-50 border-r border-neutral-100 duration-300 ease-in-out overflow-hidden hover:shadow',
          {
            '!w-0': collapsed,
          }
        )}
      >
        <div className="flex flex-col w-64 h-full">
          <div className="flex items-center h-11 px-2">
            <Button
              className="p-0 !w-10"
              variant="light"
              fullWidth
              isIconOnly
              onClick={() => {
                setCollapsed(true);
              }}
            >
              <PanelLeftClose className="w-5 h-5 text-neutral-400" />
            </Button>
          </div>
          <ScrollShadow className="flex-1 px-2">
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
                    onSwitch?.(selectedIndex);
                  } else {
                    setSelectedItems([]);
                  }
                }
              }}
            >
              <Tree treeId="outline" rootItem={language} treeLabel="Outline" />
            </ControlledTreeEnvironment>
          </ScrollShadow>
        </div>
      </div>
      <div
        className={clsx(
          'fixed top-0 left-64 right-0 flex justify-between items-center h-11 px-4 bg-white duration-300 ease-in-out',
          {
            '!left-0 !px-2': collapsed,
          }
        )}
      >
        <div className="flex w-full justify-between items-center">
          <div className="flex items-center">
            {collapsed ? (
              <Button
                className="mr-2 p-0 !w-10"
                variant="light"
                fullWidth
                isIconOnly
                onClick={() => {
                  setCollapsed(false);
                }}
              >
                <PanelLeftClose className="w-5 h-5 text-neutral-400" />
              </Button>
            ) : null}
            <Breadcrumbs>
              {feature.split('/').map((key, index, array) => {
                const featureIndex = array.slice(0, index + 1).join('/');
                const feature = treeData[featureIndex];
                const url = `/${featureIndex}`;
                return (
                  <BreadcrumbItem
                    key={index}
                    href={url}
                    onClick={(event) => {
                      event.preventDefault();
                      onSwitch?.(featureIndex);
                    }}
                  >
                    {feature?.data?.title ?? key}
                  </BreadcrumbItem>
                );
              })}
            </Breadcrumbs>
          </div>
          <div>
            <Dropdown>
              <DropdownTrigger>
                <Button
                  className="p-0 !w-10"
                  variant="light"
                  fullWidth
                  isIconOnly
                  onClick={() => {
                    setCollapsed(false);
                  }}
                >
                  <Ellipsis className="w-5 h-5 text-neutral-400" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Static Actions">
                <DropdownItem key="new">New file</DropdownItem>
                <DropdownItem key="copy">Copy link</DropdownItem>
                <DropdownItem key="edit">Edit file</DropdownItem>
                <DropdownItem
                  key="delete"
                  className="text-danger"
                  color="danger"
                >
                  Delete file
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}

export default FeatureWrapper;
