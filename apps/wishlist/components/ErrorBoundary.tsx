'use client';
import { useState } from 'react';

export default function ErrorBoundary({
  children,
}: { children?: React.JSX.Element | React.ReactNode }) {
  const [error, setError] = useState<Error | null>(null);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-4xl font-bold text-red-500">Error</h1>
        <p className="text-xl text-gray-500">{error.message}</p>
      </div>
    );
  }

  return (
    <ErrorBoundaryFallback onError={setError}>{children}</ErrorBoundaryFallback>
  );
}

function ErrorBoundaryFallback({
  children,
  onError,
}: {
  children?: React.JSX.Element | React.ReactNode;
  onError: (error: Error) => void;
}) {
  try {
    return children;
  } catch (error) {
    onError(error as Error);
    return null;
  }
}
