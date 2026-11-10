import { NextResponse } from "next/server";

function getBackendBase() {
  const url = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL;
  return url ? url.trim().replace(/\/+$/, "") : "";
}

async function proxyRequest(request, { params }) {
  const backendBase = getBackendBase();

  if (!backendBase) {
    return NextResponse.json(
      {
        success: false,
        message: "Backend URL is not configured. Please define BACKEND_URL or NEXT_PUBLIC_API_URL in your .env.local file.",
      },
      { status: 503 }
    );
  }

  const resolvedParams = await params;
  const pathParts = resolvedParams.path || [];
  const path = pathParts.join("/");
  const url = new URL(request.url);
  const targetUrl = `${backendBase}/api/auth/${path}${url.search}`;

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    // Avoid forwarding host or content-length that might conflict
    const lower = key.toLowerCase();
    if (!["host", "connection", "content-length"].includes(lower)) {
      headers.set(key, value);
    }
  });

  let body = undefined;
  if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method)) {
    try {
      body = await request.text();
    } catch {
      // body empty or unreadable
    }
  }

  try {
    const res = await fetch(targetUrl, {
      method: request.method,
      headers,
      body,
      redirect: "manual",
      cache: "no-store",
    });

    const responseData = await res.text();
    const responseHeaders = new Headers();
    res.headers.forEach((value, key) => {
      const lower = key.toLowerCase();
      if (!["content-encoding", "content-length", "transfer-encoding"].includes(lower)) {
        responseHeaders.set(key, value);
      }
    });

    return new NextResponse(responseData, {
      status: res.status,
      statusText: res.statusText,
      headers: responseHeaders,
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        message: `Unable to connect to backend server. Please verify backend status and network connection. Error: ${err.message}`,
      },
      { status: 502 }
    );
  }
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
export const OPTIONS = proxyRequest;
