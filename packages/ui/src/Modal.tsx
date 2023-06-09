'use client';
import React from 'react';
import { Card, CardProps } from './Card';

interface Props {
  show: boolean;
  children: React.ReactNode;
  cardProps: CardProps;
}

export const Modal = ({ show, cardProps, children }: Props) => {
  const { title, subtitle, action } = cardProps;
  if (!show) return <></>;
  return (
    <>
      <div className="ui-bg-blue-50 bg-opacity-25 fixed inset-0 z-40 w-full h-full">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div className="relative w-auto my-6 mx-auto max-w-3xl">
            {/*content*/}
            <div className="min-w-max w-full">
              <Card title={title} subtitle={subtitle} action={action}>
                {children}
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Modal;
