import clsx from 'clsx';
import { ReactNode, useEffect, useState } from 'react';
import { ChevronsLeft, ChevronsRight, Plus } from 'lucide-react';
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
import { loadLanguage, LanguageOutline } from '@/language';
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
  language: string;
  feature: string;
  sidebarEnable: boolean;
  children: ReactNode;
  onSwitch?: (index: string) => void;
}

export function FeatureWrapper({
  language,
  feature,
  sidebarEnable,
  children,
  onSwitch,
}: FeatureWrapperProps) {
  const [collapsed, setCollapsed] = useState(sidebarEnable ? false : true);
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
        </div>
        {menu}
      </div>
    </div>
  );

  const toolbarLeft = (
    <div className="flex items-center">
      {collapsed && sidebarEnable ? (
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
            hidden: !sidebarEnable,
          })}
          variant="light"
          fullWidth
          isIconOnly
          onClick={() => {
            setCollapsed(false);
          }}
        >
          {compareLang}
          <Plus className="w-5 h-5 text-neutral-400" />
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        onAction={(key: any) => {
          setCompareLang(key);
        }}
      >
        <DropdownItem
          key="kotlin"
          startContent={<i className="devicon-kotlin-plain" />}
        >
          Kotlin
        </DropdownItem>
        <DropdownItem
          key="Swift"
          startContent={<i className="devicon-swift-plain" />}
        >
          Swift
        </DropdownItem>
        <DropdownItem
          key="typescript"
          startContent={<i className="devicon-typescript-plain" />}
        >
          Typescript
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
  const toolbarRight = <div>{compareButton}</div>;
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
            language={compareLang}
            index={compareFeature}
            sidebarEnable={false}
            onSwitch={(newIndex) => {
              console.log(newIndex);
              // navigate(`/${newIndex}`);
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
