/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

import cx from 'classnames';
import * as React from 'react';
import type { PolymorphicForwardRefComponent } from '../utils/index.js';
import { Button } from '../Buttons/index.js';
import type { ButtonProps } from '../Buttons/Button/Button.js';
import '@itwin/itwinui-css/css/side-navigation.css';

type SidenavButtonProps = {
  /**
   * Whether the sidenav button is active,
   * i.e. the current page corresponds to this button.
   */
  isActive?: boolean;
  /**
   * Whether the sidenav button only has submenu open,
   * i.e. submenu is open but the current page does not correspond to this button.
   */
  isSubmenuOpen?: boolean;
} & Omit<ButtonProps, 'styleType' | 'size'>;

/**
 * Wrapper around Button to be used as SideNavigation items.
 * Label is hidden when sidenav is collapsed.
 */
export const SidenavButton = React.forwardRef((props, ref) => {
  const {
    className,
    children,
    isActive = false,
    disabled = false,
    isSubmenuOpen = false,
    ...rest
  } = props;

  return (
    <Button
      className={cx(
        'iui-sidenav-button',
        { 'iui-submenu-open': isSubmenuOpen },
        className,
      )}
      data-iui-active={isActive}
      size='large'
      disabled={disabled}
      ref={ref}
      {...rest}
    >
      {children}
    </Button>
  );
}) as PolymorphicForwardRefComponent<'button', SidenavButtonProps>;

export default SidenavButton;
