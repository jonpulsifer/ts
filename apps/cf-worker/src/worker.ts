const handler: ExportedHandler = {
  async fetch(request: Request) {
    const url = new URL(request.url);

    switch (url.pathname) {
      case '/robots.txt':
        return new Response('User-agent: ia_archiver\nDisallow: /', {
          headers: { 'Content-Type': 'text/plain' },
        });
    }

    const html = `<!DOCTYPE html>
		<body>
		  <h1>hi lol</h1>
		</body>`;

    return new Response(html, {
      headers: {
        'content-type': 'text/html;charset=UTF-8',
      },
    });
  },
};

export default handler;
