import React from 'react';

import Card, { CardProps } from './Card';

interface Props {
  show: boolean;
  children: React.ReactNode;
  cardProps: CardProps;
}

const Modal = ({ show, cardProps, children }: Props) => {
  const { title, subtitle, action } = cardProps;
  if (!show) return <></>;
  return (
    <>
      <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
        <div className="relative w-auto my-6 mx-auto max-w-3xl">
          {/*content*/}
          <div className="min-w-max w-full">
            <Card title={title} subtitle={subtitle} action={action}>
              {children}
            </Card>
          </div>
        </div>
      </div>
      <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
    </>
  );
};

export default Modal;
