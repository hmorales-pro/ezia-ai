/**
 * Simple ZIP Generator using Node.js built-in APIs
 * No external dependencies required
 */

import { Buffer } from 'buffer';

interface ZipFile {
  name: string;
  content: string | Buffer;
  date?: Date;
}

export class SimpleZipGenerator {
  private files: ZipFile[] = [];

  /**
   * Add a file to the ZIP archive
   */
  addFile(name: string, content: string | Buffer, date?: Date): void {
    this.files.push({
      name: name.replace(/\\/g, '/'), // Normalize path separators
      content,
      date: date || new Date()
    });
  }

  /**
   * Generate the ZIP file as a Buffer
   * Uses ZIP format specification (PKZIP)
   */
  async generate(): Promise<Buffer> {
    const centralDirectory: Buffer[] = [];
    const fileData: Buffer[] = [];
    let offset = 0;

    for (const file of this.files) {
      const content = typeof file.content === 'string'
        ? Buffer.from(file.content, 'utf-8')
        : file.content;

      const fileName = Buffer.from(file.name, 'utf-8');
      const fileDate = this.getDosDateTime(file.date || new Date());
      const crc32 = this.calculateCRC32(content);

      // Local file header
      const localHeader = Buffer.alloc(30 + fileName.length);
      localHeader.writeUInt32LE(0x04034b50, 0); // Local file header signature
      localHeader.writeUInt16LE(20, 4); // Version needed to extract
      localHeader.writeUInt16LE(0, 6); // General purpose bit flag
      localHeader.writeUInt16LE(0, 8); // Compression method (0 = stored, no compression)
      localHeader.writeUInt16LE(fileDate.time, 10); // File modification time
      localHeader.writeUInt16LE(fileDate.date, 12); // File modification date
      localHeader.writeUInt32LE(crc32, 14); // CRC-32
      localHeader.writeUInt32LE(content.length, 18); // Compressed size
      localHeader.writeUInt32LE(content.length, 22); // Uncompressed size
      localHeader.writeUInt16LE(fileName.length, 26); // File name length
      localHeader.writeUInt16LE(0, 28); // Extra field length
      fileName.copy(localHeader, 30); // File name

      fileData.push(localHeader);
      fileData.push(content);

      // Central directory file header
      const centralHeader = Buffer.alloc(46 + fileName.length);
      centralHeader.writeUInt32LE(0x02014b50, 0); // Central directory signature
      centralHeader.writeUInt16LE(20, 4); // Version made by
      centralHeader.writeUInt16LE(20, 6); // Version needed to extract
      centralHeader.writeUInt16LE(0, 8); // General purpose bit flag
      centralHeader.writeUInt16LE(0, 10); // Compression method
      centralHeader.writeUInt16LE(fileDate.time, 12); // File modification time
      centralHeader.writeUInt16LE(fileDate.date, 14); // File modification date
      centralHeader.writeUInt32LE(crc32, 16); // CRC-32
      centralHeader.writeUInt32LE(content.length, 20); // Compressed size
      centralHeader.writeUInt32LE(content.length, 24); // Uncompressed size
      centralHeader.writeUInt16LE(fileName.length, 28); // File name length
      centralHeader.writeUInt16LE(0, 30); // Extra field length
      centralHeader.writeUInt16LE(0, 32); // File comment length
      centralHeader.writeUInt16LE(0, 34); // Disk number start
      centralHeader.writeUInt16LE(0, 36); // Internal file attributes
      centralHeader.writeUInt32LE(0, 38); // External file attributes
      centralHeader.writeUInt32LE(offset, 42); // Relative offset of local header
      fileName.copy(centralHeader, 46); // File name

      centralDirectory.push(centralHeader);

      offset += localHeader.length + content.length;
    }

    // End of central directory record
    const centralDirSize = centralDirectory.reduce((sum, buf) => sum + buf.length, 0);
    const endOfCentralDir = Buffer.alloc(22);
    endOfCentralDir.writeUInt32LE(0x06054b50, 0); // End of central directory signature
    endOfCentralDir.writeUInt16LE(0, 4); // Number of this disk
    endOfCentralDir.writeUInt16LE(0, 6); // Disk where central directory starts
    endOfCentralDir.writeUInt16LE(this.files.length, 8); // Number of central directory records on this disk
    endOfCentralDir.writeUInt16LE(this.files.length, 10); // Total number of central directory records
    endOfCentralDir.writeUInt32LE(centralDirSize, 12); // Size of central directory
    endOfCentralDir.writeUInt32LE(offset, 16); // Offset of start of central directory
    endOfCentralDir.writeUInt16LE(0, 20); // ZIP file comment length

    // Combine all parts
    return Buffer.concat([
      ...fileData,
      ...centralDirectory,
      endOfCentralDir
    ]);
  }

  /**
   * Calculate CRC32 checksum
   */
  private calculateCRC32(buffer: Buffer): number {
    let crc = 0xFFFFFFFF;

    for (let i = 0; i < buffer.length; i++) {
      const byte = buffer[i];
      crc = crc ^ byte;

      for (let j = 0; j < 8; j++) {
        if ((crc & 1) !== 0) {
          crc = (crc >>> 1) ^ 0xEDB88320;
        } else {
          crc = crc >>> 1;
        }
      }
    }

    return (crc ^ 0xFFFFFFFF) >>> 0;
  }

  /**
   * Convert JavaScript Date to DOS date/time format
   */
  private getDosDateTime(date: Date): { date: number; time: number } {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = Math.floor(date.getSeconds() / 2); // DOS time has 2-second precision

    const dosDate = ((year - 1980) << 9) | (month << 5) | day;
    const dosTime = (hours << 11) | (minutes << 5) | seconds;

    return { date: dosDate, time: dosTime };
  }
}
