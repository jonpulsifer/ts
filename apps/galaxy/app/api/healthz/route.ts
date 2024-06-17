import { NextResponse } from 'next/server';

const PACKAGE_VERSION = process.env.npm_package_version;
const PACKAGE_NAME = process.env.npm_package_name;
const NODE_ENV = process.env.NODE_ENV;

export function GET(): NextResponse {
  return NextResponse.json({
    status: 'ok',
    timestamp: Date.now(),
    version: PACKAGE_VERSION,
    name: PACKAGE_NAME,
    environment: NODE_ENV,
  });
}
