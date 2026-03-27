import React from 'react';
import Providers from '@/src/app/providers';

const RootLayout: React.FC<{children: React.ReactNode}> = ({children}) => {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
};

export default RootLayout;