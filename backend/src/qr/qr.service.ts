import { Injectable, BadRequestException } from '@nestjs/common';
import * as QRCode from 'qrcode';

@Injectable()
export class QrService {
  /**
   * Generates a standard QR Code image buffer.
   */
  async generateQrBuffer(text: string, options: any = {}): Promise<Buffer> {
    try {
      const qrOptions = {
        errorCorrectionLevel: options.errorCorrectionLevel || 'H', // Use high error correction by default
        type: 'png',
        margin: options.margin !== undefined ? options.margin : 4,
        width: options.width || 512,
        color: {
          dark: options.darkColor || '#000000',
          light: options.lightColor || '#ffffff',
        },
      };

      return await QRCode.toBuffer(text, qrOptions as any);
    } catch (err) {
      throw new BadRequestException(`Failed to generate QR Code buffer: ${err.message}`);
    }
  }

  /**
   * Converts various structured QR payloads into standard QR text protocols.
   */
  formatQrData(type: string, data: any): string {
    if (!type || !data) {
      throw new BadRequestException('QR type and data payload are required');
    }

    const typeLower = type.toLowerCase();
    switch (typeLower) {
      case 'url':
        if (!data.url) throw new BadRequestException('URL is required');
        return data.url;

      case 'text':
        if (!data.text) throw new BadRequestException('Text is required');
        return data.text;

      case 'email':
        if (!data.email) throw new BadRequestException('Email address is required');
        const emailSubject = encodeURIComponent(data.subject || '');
        const emailBody = encodeURIComponent(data.body || '');
        return `mailto:${data.email}?subject=${emailSubject}&body=${emailBody}`;

      case 'phone':
        if (!data.phone) throw new BadRequestException('Phone number is required');
        return `tel:${data.phone}`;

      case 'whatsapp':
        if (!data.phone) throw new BadRequestException('Phone number is required');
        const waText = encodeURIComponent(data.text || '');
        return `https://wa.me/${data.phone.replace(/[^0-9]/g, '')}?text=${waText}`;

      case 'wifi':
        if (!data.ssid) throw new BadRequestException('SSID is required');
        const encryption = data.encryption || 'WPA';
        const password = data.password || '';
        const hidden = data.hidden ? 'H' : '';
        return `WIFI:S:${data.ssid};T:${encryption};P:${password};${hidden};`;

      case 'sms':
        if (!data.phone) throw new BadRequestException('Recipient phone number is required');
        const smsMessage = data.message || '';
        return `SMSTO:${data.phone}:${smsMessage}`;

      case 'vcard':
        if (!data.firstName || !data.lastName) {
          throw new BadRequestException('First Name and Last Name are required');
        }
        return [
          'BEGIN:VCARD',
          'VERSION:3.0',
          `N:${data.lastName};${data.firstName};;;`,
          `FN:${data.firstName} ${data.lastName}`,
          data.organization ? `ORG:${data.organization}` : '',
          data.title ? `TITLE:${data.title}` : '',
          data.phoneCell ? `TEL;TYPE=CELL:${data.phoneCell}` : '',
          data.phoneWork ? `TEL;TYPE=WORK,VOICE:${data.phoneWork}` : '',
          data.email ? `EMAIL;TYPE=PREF,INTERNET:${data.email}` : '',
          data.url ? `URL:${data.url}` : '',
          data.address ? `ADR:;;${data.address};;;;` : '',
          'END:VCARD'
        ].filter(Boolean).join('\n');

      case 'event':
        if (!data.summary || !data.startDateTime || !data.endDateTime) {
          throw new BadRequestException('Event Summary, Start Date, and End Date are required');
        }
        const formatDate = (dateStr: string) => {
          const date = new Date(dateStr);
          return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        };
        return [
          'BEGIN:VCALENDAR',
          'VERSION:2.0',
          'BEGIN:VEVENT',
          `SUMMARY:${data.summary}`,
          data.description ? `DESCRIPTION:${data.description}` : '',
          data.location ? `LOCATION:${data.location}` : '',
          `DTSTART:${formatDate(data.startDateTime)}`,
          `DTEND:${formatDate(data.endDateTime)}`,
          'END:VEVENT',
          'END:VCALENDAR'
        ].join('\n');

      case 'location':
        if (data.latitude === undefined || data.longitude === undefined) {
          throw new BadRequestException('Latitude and Longitude are required');
        }
        return `https://maps.google.com/?q=${data.latitude},${data.longitude}`;

      case 'pdf':
        // The frontend uploads the PDF first, and registers it as a PDF QR which wraps the URL.
        if (!data.pdfUrl) throw new BadRequestException('PDF URL is required');
        return data.pdfUrl;

      default:
        throw new BadRequestException(`Unsupported QR code type: ${type}`);
    }
  }
}
