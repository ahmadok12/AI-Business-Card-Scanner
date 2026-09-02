import type { BusinessCard } from '../types';

export function generateVCardString(card: BusinessCard): string {
  const nameParts = card.name.trim().split(' ');
  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
  const firstName = nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : card.name;

  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${card.name}`,
    `N:${lastName};${firstName};;;`
  ];

  if (card.company) lines.push(`ORG:${card.company}`);
  if (card.title) lines.push(`TITLE:${card.title}`);
  if (card.phone) lines.push(`TEL;TYPE=CELL,VOICE:${card.phone}`);
  if (card.secondaryPhone) lines.push(`TEL;TYPE=WORK,VOICE:${card.secondaryPhone}`);
  if (card.email) lines.push(`EMAIL;TYPE=INTERNET,PREF:${card.email}`);
  if (card.website) lines.push(`URL:${card.website}`);
  if (card.address) lines.push(`ADR;TYPE=WORK:;;${card.address.replace(/,/g, ';')};;;`);
  if (card.notes) lines.push(`NOTE:${card.notes.replace(/\n/g, '\\n')}`);
  if (card.blockName) lines.push(`CATEGORIES:${card.blockName}`);

  lines.push('END:VCARD');
  return lines.join('\r\n');
}

export function downloadVCard(card: BusinessCard): void {
  const vcardContent = generateVCardString(card);
  const blob = new Blob([vcardContent], { type: 'text/vcard;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const safeName = card.name.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'contact';
  link.href = url;
  link.setAttribute('download', `${safeName}.vcf`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
