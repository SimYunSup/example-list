import type { PropsWithChildren } from "react";

import React from 'react';
import { Provider, defaultTheme } from '@adobe/react-spectrum';

export function AdobeProvider({
  children
}: PropsWithChildren) {
  return (
    <Provider theme={defaultTheme} UNSAFE_style={{ backgroundColor: 'transparent' }}>
      {children}
    </Provider>
  )
}