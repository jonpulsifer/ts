'use server'

import dns from "node:dns/promises";
import { exec } from "node:child_process";
import util from "node:util";

const execPromise = util.promisify(exec)

export async function performNetworkAction(formData: FormData) {
  const tool = formData.get('tool') as string
  const target = formData.get('target') as string

  if (!tool || !target) {
    throw new Error('Tool and target are required')
  }

  switch (tool) {
    case 'dns': {
      const results = await Promise.all([
        dns.resolve(target, 'A').catch(() => []),
        dns.resolve(target, 'AAAA').catch(() => []),
        dns.resolve(target, 'MX').catch(() => []),
        dns.resolve(target, 'TXT').catch(() => []),
        dns.resolve(target, 'NS').catch(() => [])
      ])

      return {
        A: results[0],
        AAAA: results[1],
        MX: results[2],
        TXT: results[3],
        NS: results[4]
      }
    }

    case 'whois': {
      const { stdout } = await execPromise(`whois ${target}`)
      return { result: stdout }
    }

    case 'ping': {
      const { stdout } = await execPromise(`ping -c 4 ${target}`)
      return { result: stdout }
    }

    case 'ssl': {
      const { stdout } = await execPromise(
        `echo | openssl s_client -connect ${target}:443 -servername ${target} 2>/dev/null | openssl x509 -noout -text`
      )
      return { result: stdout }
    }

    default:
      throw new Error('Invalid tool specified')
  }
}
