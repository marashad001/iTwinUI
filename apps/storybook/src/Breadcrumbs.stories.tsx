/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { Story, Meta } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { useState } from '@storybook/addons';
import React from 'react';
import {
  Button,
  IconButton,
  Breadcrumbs,
  BreadcrumbsProps,
  DropdownButton,
  DropdownMenu,
  MenuItem,
  Input,
  Tooltip,
} from '@itwin/itwinui-react';
import {
  SvgChevronRightDouble,
  SvgFolder,
  SvgMore,
} from '@itwin/itwinui-icons-react';

export default {
  component: Breadcrumbs,
  title: 'Core/Breadcrumbs',
  argTypes: {
    className: { control: { disable: true } },
    style: { control: { disable: true } },
    id: { control: { disable: true } },
    children: { control: { disable: true } },
  },
} as Meta<BreadcrumbsProps>;

export const Basic: Story<BreadcrumbsProps> = (args) => {
  return (
    <Breadcrumbs {...args}>
      <Button key={0} onClick={() => action('Root')()}>
        Root
      </Button>
      <Button key={1} onClick={() => action('Item 1')()}>
        Item 1
      </Button>
      <Button key={2} onClick={() => action('Item 2')()}>
        Item 2
      </Button>
    </Breadcrumbs>
  );
};

export const Links: Story<BreadcrumbsProps> = (args) => {
  return (
    <Breadcrumbs {...args}>
      <a key={0} href='/'>
        iTwinUI
      </a>
      <a key={1} href='/?path=/docs/core-breadcrumbs'>
        Breadcrumbs
      </a>
      <span key={2}>Links</span>
    </Breadcrumbs>
  );
};

export const CustomSeparator: Story<BreadcrumbsProps> = (args) => {
  return (
    <Breadcrumbs separator={<SvgChevronRightDouble />} {...args}>
      <Button key={0} onClick={() => action('Root')()}>
        Root
      </Button>
      <Button key={1} onClick={() => action('Item 1')()}>
        Item 1
      </Button>
      <Button key={2} onClick={() => action('Item 2')()}>
        Item 2
      </Button>
    </Breadcrumbs>
  );
};
CustomSeparator.args = {
  separator: <SvgChevronRightDouble />,
};

export const Overflow: Story<BreadcrumbsProps> = (args) => {
  const items = Array(10)
    .fill(null)
    .map((_, index) => (
      <Button
        key={index}
        onClick={() => action(`Clicked on breadcrumb ${index + 1}`)()}
      >
        Item {index}
      </Button>
    ));

  return (
    <div style={{ maxWidth: '50%', border: '1px solid lightpink', padding: 8 }}>
      <Breadcrumbs {...args}>{items}</Breadcrumbs>
    </div>
  );
};

export const CustomOverflowBackButton: Story<BreadcrumbsProps> = (args) => {
  const items = React.useMemo(
    () =>
      Array(10)
        .fill(null)
        .map((_, index) =>
          index === 2 ? 'Very long item number two' : `Item ${index}`,
        ),
    [],
  );

  const [lastIndex, setLastIndex] = useState(items.length - 1);

  const breadcrumbItems = React.useMemo(
    () =>
      items.slice(0, lastIndex + 1).map((item, index) => (
        <Button
          key={`Breadcrumb${index}`}
          onClick={() => {
            if (lastIndex !== index) {
              setLastIndex(index);
            }
            action(`Clicked on breadcrumb ${index + 1}`)();
          }}
        >
          {item}
        </Button>
      )),
    [items, lastIndex],
  );

  return (
    <>
      <div
        style={{
          width: '50%',
          maxWidth: 725,
          minWidth: 150,
          border: '1px solid lightpink',
          padding: 8,
        }}
      >
        <Breadcrumbs
          overflowButton={(visibleCount: number) => {
            const previousBreadcrumb =
              visibleCount > 1 ? lastIndex + 1 - visibleCount : lastIndex - 1;
            return (
              <Tooltip
                content={
                  previousBreadcrumb === 2
                    ? 'Very long item number two'
                    : `Item ${previousBreadcrumb}`
                }
                placement='bottom'
              >
                <IconButton
                  aria-label={
                    previousBreadcrumb === 2
                      ? 'Very long item number two'
                      : `Item ${previousBreadcrumb}`
                  }
                  style={{ paddingTop: '8px' }}
                  onClick={() => {
                    action(`Visit breadcrumb ${previousBreadcrumb}`)();
                    setLastIndex(previousBreadcrumb);
                  }}
                >
                  <SvgMore />
                </IconButton>
              </Tooltip>
            );
          }}
          {...args}
        >
          {breadcrumbItems}
        </Breadcrumbs>
      </div>
      <br />
      <DropdownMenu
        menuItems={(close) =>
          Array(items.length)
            .fill(null)
            .map((_, index) => {
              const onClick = () => {
                setLastIndex(index);
                close();
              };
              return (
                <MenuItem key={index} onClick={onClick}>
                  Item {index}
                </MenuItem>
              );
            })
        }
      >
        <Button aria-label='Dropdown with more breadcrumbs'>
          All breadcrumbs
        </Button>
      </DropdownMenu>
    </>
  );
};

export const CustomOverflowDropdown: Story<BreadcrumbsProps> = (args) => {
  const items = Array(10)
    .fill(null)
    .map((_, index) => (
      <Button
        key={index}
        onClick={() => action(`Clicked on breadcrumb ${index + 1}`)()}
      >
        Item {index}
      </Button>
    ));

  return (
    <div
      style={{
        width: '50%',
        maxWidth: 725,
        minWidth: 150,
        border: '1px solid lightpink',
        padding: 8,
      }}
    >
      <Breadcrumbs
        overflowButton={(visibleCount: number) => (
          <DropdownMenu
            menuItems={(close) =>
              Array(items.length - visibleCount)
                .fill(null)
                .map((_, _index) => {
                  const index = visibleCount > 1 ? _index + 1 : _index;
                  const onClick = () => {
                    action(`Visit breadcrumb ${index}`)();
                    close();
                  };
                  return (
                    <MenuItem key={index} onClick={onClick}>
                      Item {index}
                    </MenuItem>
                  );
                })
            }
          >
            <IconButton
              aria-label='Dropdown with more breadcrumbs'
              onClick={() => action('Clicked on overflow icon')()}
            >
              <SvgMore />
            </IconButton>
          </DropdownMenu>
        )}
        {...args}
      >
        {items}
      </Breadcrumbs>
    </div>
  );
};

export const FolderNavigation: Story<BreadcrumbsProps> = (args) => {
  const items = React.useMemo(
    () => ['Root', 'Level 1', 'Level 2', 'Level 3', 'Level 4'],
    [],
  );

  const [lastIndex, setLastIndex] = useState(items.length - 1);
  const [isEditing, setIsEditing] = useState(false);

  const breadcrumbItems = React.useMemo(
    () =>
      items.slice(0, lastIndex + 1).map((item, index) => (
        <Button
          key={`Breadcrumb${index}`}
          onClick={() => {
            if (lastIndex !== index) {
              setLastIndex(index);
            } else {
              setIsEditing(true);
            }
          }}
        >
          {item}
        </Button>
      )),
    [items, lastIndex],
  );

  return (
    <div style={{ display: 'inline-flex', width: 450 }}>
      <DropdownButton
        startIcon={<SvgFolder aria-hidden />}
        styleType='borderless'
        menuItems={(close) =>
          items.map((item, index) => (
            <MenuItem
              key={`Item${index}`}
              onClick={() => {
                setLastIndex(index);
                setIsEditing(false);
                close();
              }}
            >
              {item}
            </MenuItem>
          ))
        }
      />
      {isEditing ? (
        <Input
          setFocus
          defaultValue={items.slice(0, lastIndex + 1).join('/')}
          onChange={({ target: { value } }) => {
            const lastItem = value.substring(
              value.lastIndexOf('/', value.length - 2) + 1,
            );
            setLastIndex(items.findIndex((item) => lastItem.includes(item)));
          }}
          onKeyDown={({ key }) => key === 'Enter' && setIsEditing(false)}
          onBlur={() => setIsEditing(false)}
        />
      ) : (
        <Breadcrumbs {...args}>{breadcrumbItems}</Breadcrumbs>
      )}
    </div>
  );
};
