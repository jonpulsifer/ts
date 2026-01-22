export function buildIsoIpxeScript(isoUrl: string, isoName?: string) {
  const safeName = isoName?.trim() ? isoName.trim() : 'ISO';
  return `#!ipxe
set iso_url ${isoUrl}

echo Spore: booting ${safeName}
echo ${isoUrl}

sanboot --no-describe --drive 0x80 \${iso_url} || goto failed

:failed
echo Spore: failed to boot ISO
sleep 5
exit
`;
}
