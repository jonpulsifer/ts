import React from 'react';

interface Props {
  children: React.ReactNode;
}

const Layout = (props: Props) => {
  const { children } = props;
  return <main className="flex flex-col min-h-screen">{children}</main>;
};

export default Layout;
