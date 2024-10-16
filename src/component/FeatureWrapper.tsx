import clsx from 'clsx';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import {
  ChevronsLeft,
  ChevronsRight,
  ListCollapse,
  Plus,
  X,
} from 'lucide-react';
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
import 'devicon/devicon.min.css';
import LOGO from '@/asset/logo.svg';
import { LanguageOutline, languages, loadLanguage } from '@/language';
import Feature from './Feature';

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
  comparer?: string;
  language: string;
  feature: string;
  children: ReactNode;
  onSwitch?: (index: string) => void;
  onClose?: () => void;
}

export function FeatureWrapper({
  comparer,
  language,
  feature,
  children,
  onSwitch,
  onClose,
}: FeatureWrapperProps) {
  const [collapsed, setCollapsed] = useState(comparer ? true : false);
  const [treeData, setTreeData] = useState<Record<string, OutlineTreeItem>>({});
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const collapsableItems = useMemo(() => {
    return Object.keys(treeData).filter((key) => {
      return (treeData[key].children?.length ?? 0) > 0;
    });
  }, [treeData]);
  useEffect(() => {
    setExpandedItems(collapsableItems);
  }, [collapsableItems]);
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
  const menu = (
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
  );
  const sidebar = (
    <div
      className={clsx(
        'group fixed top-0 left-0 bottom-0 w-64 bg-neutral-50 border-r border-neutral-100 overflow-hidden duration-300 ease-in-out hover:shadow',
        {
          '!w-0': collapsed,
        }
      )}
    >
      <div className="flex flex-col w-64 h-full">
        <div className="flex justify-between items-center h-11 px-1">
          <Button
            size="sm"
            variant="light"
            startContent={
              <img className="block w-5 h-5 rounded-full" src={LOGO} />
            }
            onClick={() => {
              setCollapsed(true);
            }}
          >
            <span className="font-semibold text-neutral-600">CHEATSHEET</span>
          </Button>
          <div className="flex items-center">
            <Button
              className="hidden p-0 !w-10 group-hover:flex"
              size="sm"
              variant="light"
              isIconOnly
              onClick={() => {
                setCollapsed(true);
              }}
            >
              <ChevronsLeft className="w-5 h-5 text-neutral-400" />
            </Button>
            <Button
              className="hidden p-0 !w-10 group-hover:flex"
              size="sm"
              variant="light"
              isIconOnly
              onClick={() => {
                if (collapsableItems.length != expandedItems.length) {
                  setExpandedItems(collapsableItems);
                } else {
                  setExpandedItems(['swift']);
                }
              }}
            >
              <ListCollapse className="w-5 h-5 text-neutral-400" />
            </Button>
          </div>
        </div>
        {menu}
      </div>
    </div>
  );

  const toolbarLeft = (
    <div className="flex items-center">
      {collapsed && !comparer ? (
        <Button
          className="mr-2 p-0 !w-10"
          variant="light"
          fullWidth
          isIconOnly
          onClick={() => {
            setCollapsed(false);
          }}
        >
          <ChevronsRight className="w-5 h-5 text-neutral-400" />
        </Button>
      ) : null}
      <Breadcrumbs>
        {feature.split('/').map((key, index, array) => {
          const featureIndex = array.slice(0, index + 1).join('/');
          const feature = treeData[featureIndex];
          // const url = `/${featureIndex}`;
          const featureItem = treeData[featureIndex];
          const parentItem = treeData[featureItem?.data?.parentIndex ?? ''];
          let content: ReactNode = (
            <span className="cursor-pointer">
              {feature?.data?.title ?? key}
            </span>
          );
          if (parentItem && (parentItem.children?.length ?? 0) > 0) {
            content = (
              <Dropdown>
                <DropdownTrigger>{content}</DropdownTrigger>
                <DropdownMenu>
                  {(parentItem.children || []).map((childIndex) => {
                    const childItem = treeData[childIndex];
                    return (
                      <DropdownItem
                        key={childIndex}
                        onClick={() => {
                          onSwitch?.(String(childItem?.index ?? ''));
                        }}
                      >
                        {childItem.data?.title ?? ''}
                      </DropdownItem>
                    );
                  })}
                </DropdownMenu>
              </Dropdown>
            );
          } else if (index === 0) {
            content = (
              <Dropdown>
                <DropdownTrigger>{content}</DropdownTrigger>
                <DropdownMenu>
                  {languages
                    .filter((item) => item.value !== comparer)
                    .map((item) => (
                      <DropdownItem
                        key={item.value}
                        onClick={() => {
                          onSwitch?.(item.value);
                        }}
                      >
                        {item.label}
                      </DropdownItem>
                    ))}
                </DropdownMenu>
              </Dropdown>
            );
          }
          return (
            <BreadcrumbItem
              key={index}
              onClick={(event) => {
                event.preventDefault();
                // onSwitch?.(featureIndex);
              }}
            >
              {content}
            </BreadcrumbItem>
          );
        })}
      </Breadcrumbs>
    </div>
  );

  const [compareLang, setCompareLang] = useState('');
  const [compareFeature, setCompareFeature] = useState('');
  useEffect(() => {
    if (compareLang) {
      const items = feature.split('/');
      items[0] = compareLang;
      setCompareFeature(items.join('/'));
    }
  }, [compareLang, feature]);
  const compareButton = (
    <Dropdown>
      <DropdownTrigger>
        <Button
          className={clsx('p-0 !w-10', {
            hidden: comparer,
          })}
          variant="light"
          fullWidth
          isIconOnly
          onClick={() => {
            setCollapsed(false);
          }}
        >
          <Plus className="w-5 h-5 text-neutral-400" />
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        onAction={(key: any) => {
          setCompareLang(key);
        }}
      >
        {languages
          .filter((item) => item.value !== language)
          .map((item) => {
            return (
              <DropdownItem
                key={item.value}
                startContent={<i className={`devicon-${item.value}-plain`} />}
              >
                {item.label}
              </DropdownItem>
            );
          })}
      </DropdownMenu>
    </Dropdown>
  );
  const closeButton = (
    <Button
      className={clsx('p-0 !w-10', {
        hidden: !comparer,
      })}
      variant="light"
      fullWidth
      isIconOnly
      onClick={onClose}
    >
      <X className="w-5 h-5 text-neutral-400" />
    </Button>
  );
  const toolbarRight = (
    <div className="flex items-center">
      {closeButton}
      {compareButton}
    </div>
  );
  const toolbar = (
    <div
      className={clsx(
        'fixed top-0 left-64 right-0 flex justify-between items-center h-11 px-4 bg-white duration-300 ease-in-out pointer-events-auto',
        {
          '!left-0 !px-2': collapsed,
        }
      )}
    >
      <div className="flex w-full justify-between items-center">
        {toolbarLeft}
        {toolbarRight}
      </div>
    </div>
  );
  const main = (
    <div
      className={clsx('pt-11 pl-64 duration-300 ease-in-out', {
        '!pl-0': collapsed,
        '2xl:pr-[768px] 3xl:pr-[864px] 4xl:pr-[1024px]': compareLang,
      })}
    >
      {sidebar}
      {toolbar}
      {children}
    </div>
  );
  const second = (
    <div
      className={clsx(
        'fixed top-0 right-0 bottom-0 w-[768px] max-w-full border-l shadow translate-x-full pointer-events-none duration-300 ease-in-out 3xl:w-[864px] 4xl:w-[1024px]',
        {
          '!translate-x-0': compareLang,
        }
      )}
    >
      <div className="w-full h-full pointer-events-auto bg-white overflow-auto">
        {compareLang ? (
          <Feature
            comparer={language}
            language={compareLang}
            index={compareFeature}
            sidebarEnable={false}
            onSwitch={(newIndex) => {
              setCompareFeature(newIndex);
            }}
            onClose={() => {
              setCompareLang('');
              setCompareFeature('');
            }}
          />
        ) : null}
      </div>
    </div>
  );
  return (
    <>
      {main}
      {second}
    </>
  );
}

export default FeatureWrapper;
