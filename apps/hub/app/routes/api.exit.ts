// API route to exit the Node.js process, forcing container restart
export async function loader() {
  // Exit the process with code 0 (clean exit)
  // The container orchestrator will restart it
  setTimeout(() => {
    process.exit(0);
  }, 100); // Small delay to allow response to be sent

  return new Response(
    JSON.stringify({ message: 'Process will exit shortly' }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );
}
