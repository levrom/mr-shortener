async function handleRedirect({ request, env }) {
  if (!env.REDIRECTS) {
    return new Response("KV binding REDIRECTS is not configured.", {
      status: 500,
      headers: {
        "content-type": "text/plain; charset=utf-8",
      },
    });
  }

  const url = new URL(request.url);
  const slug = url.pathname.replace(/^\/+|\/+$/g, "");

  if (!slug) {
    return new Response("Not found", {
      status: 404,
      headers: {
        "content-type": "text/plain; charset=utf-8",
      },
    });
  }

  const destination = await env.REDIRECTS.get(slug);

  if (!destination) {
    return new Response("Not found", {
      status: 404,
      headers: {
        "content-type": "text/plain; charset=utf-8",
      },
    });
  }

  try {
    const normalizedDestination = destination.trim().replace(/^["']|["']$/g, "");
    const target = /^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(normalizedDestination)
      ? new URL(normalizedDestination)
      : new URL(`https://${normalizedDestination}`);
    const response = Response.redirect(target.toString(), 302);
    response.headers.set("cache-control", "no-store");
    return response;
  } catch {
    return new Response("Stored destination is not a valid URL.", {
      status: 500,
      headers: {
        "content-type": "text/plain; charset=utf-8",
      },
    });
  }
}

export const onRequestGet = handleRedirect;
export const onRequestHead = handleRedirect;
