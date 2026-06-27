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
  const debug = url.searchParams.has("debug");

  const fail = (status, message, details = {}) => {
    if (!debug) {
      return new Response(message, {
        status,
        headers: {
          "content-type": "text/plain; charset=utf-8",
        },
      });
    }

    return new Response(
      [
        message,
        "",
        `slug: ${slug || "(empty)"}`,
        `raw: ${details.raw ?? "(missing)"}`,
        `trimmed: ${details.trimmed ?? "(missing)"}`,
        `normalized: ${details.normalized ?? "(missing)"}`,
        `error: ${details.error ?? "(none)"}`,
      ].join("\n"),
      {
        status,
        headers: {
          "content-type": "text/plain; charset=utf-8",
        },
      }
    );
  };

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
    return fail(404, "Not found", { raw: destination });
  }

  try {
    const trimmed = destination.trim();
    const normalizedDestination = trimmed.replace(/^["']|["']$/g, "");
    const target = /^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(normalizedDestination)
      ? new URL(normalizedDestination)
      : new URL(`https://${normalizedDestination}`);
    const response = Response.redirect(target.toString(), 302);
    response.headers.set("cache-control", "no-store");
    return response;
  } catch (error) {
    return fail(500, "Stored destination is not a valid URL.", {
      raw: destination,
      trimmed: destination.trim(),
      normalized: destination.trim().replace(/^["']|["']$/g, ""),
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export const onRequestGet = handleRedirect;
export const onRequestHead = handleRedirect;
