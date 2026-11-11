import { NextResponse } from "next/server";

function getBackendBase() {
  const url = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL;
  return url ? url.trim().replace(/\/+$/, "") : "";
}

async function proxyV1Request(request, { params }) {
  const backendBase = getBackendBase();

  if (!backendBase) {
    return NextResponse.json(
      {
        success: false,
        message: "Backend URL is not configured. Please define BACKEND_URL or NEXT_PUBLIC_API_URL in .env.local",
      },
      { status: 503 }
    );
  }

  const resolvedParams = await params;
  const pathParts = resolvedParams.path || [];
  const path = pathParts.join("/");
  const url = new URL(request.url);
  const targetUrl = `${backendBase}/api/v1/${path}${url.search}`;

  const headers = new Headers();
  request.headers.forEach((value, key) => {
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
        message: `Backend proxy connection error to ${targetUrl}: ${err.message}`,
      },
      { status: 502 }
    );
  }
}

export const GET = proxyV1Request;
export const POST = proxyV1Request;
export const PUT = proxyV1Request;
export const PATCH = proxyV1Request;
export const DELETE = proxyV1Request;
export const OPTIONS = proxyV1Request;

