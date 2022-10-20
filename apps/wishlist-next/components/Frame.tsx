import React from 'react';

interface Props {
  children: React.ReactNode;
}

const Frame = ({ children }: Props) => {
  return (
    <>
      <div className="flex flex-col max-w-screen items-center justify-center">
        <div className="p-4 space-y-5 sm:max-w-2xl w-full">{children}</div>
      </div>
    </>
  );
};

export default Frame;
