import React from 'react';
import Nav from './Nav';

interface Props {
  children: React.ReactNode;
  title: string;
}

const Frame = ({ children, title }: Props) => {
  return (
    <div>
      <Nav title={title} />
      <div className="flex flex-col max-w-screen items-center justify-center">
        <div className="p-4 space-y-5 sm:max-w-2xl w-full">{children}</div>
      </div>
    </div>
  );
};

export default Frame;
