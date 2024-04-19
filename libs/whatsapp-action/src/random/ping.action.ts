import { ReadMoreUnicode } from '@app/whatsapp/constants';
import { WhatsappMessage } from '@app/whatsapp/decorators/whatsapp-message.decorator';
import { WhatsappMessageAction } from '@app/whatsapp/interfaces/whatsapp.interface';
import { withSign } from '@app/whatsapp/supports/flag.support';
import type { WAMessage, WASocket } from '@whiskeysockets/baileys';
import { exec } from 'child_process';
import * as os from 'os';
import { injectRandomHiddenText } from 'src/supports/str.support';
import * as util from 'util';

@WhatsappMessage({
  flags: withSign('ping'),
})
export class PingAction extends WhatsappMessageAction {
  async execute(socket: WASocket, message: WAMessage) {
    const totalMemory = os.totalmem();

    // Memori yang digunakan oleh sistem dalam bytes
    const usedMemory = totalMemory - os.freemem();

    const [serverInfo] = await Promise.all([this.getServerInformation()]);

    const textDisk: string[] = [];

    serverInfo.disk.map((disk) => {
      textDisk.push(
        `
*${disk.fs}*
Size: ${disk.size}
Used: ${disk.used}
Available: ${disk.available}
Capacity: ${disk.capacity}
Mount: ${disk.mount}


`.trim(),
      );
    });
    socket.sendMessage(
      message.key.remoteJid,
      {
        text: injectRandomHiddenText(
          `

    
${this.getPing(message.messageTimestamp! as number)}

*Hostname:* ${serverInfo.hostname}
*Uptime:* ${serverInfo.uptime}

*OS:* ${serverInfo.os.platform} ${serverInfo.os.type} ${
            serverInfo.os.release
          } ${serverInfo.os.arch}
*CPU:* ${serverInfo.cpu.model} ${serverInfo.cpu.speed} MHz ${
            serverInfo.cpu.cores
          } cores
*Virtual Memory:* ${this.bytesToGB(usedMemory)} / ${this.bytesToGB(
            totalMemory,
          )} (${Math.round((usedMemory / totalMemory) * 100)}%)

*Disk:* 
${textDisk.join('\n\n')}

      
      
      
              `.trim(),
        ),
        contextInfo: {
          externalAdReply: {
            showAdAttribution: true,
            sourceUrl: 'https://whatsapp.com/channel/0029VabgCmX1SWt6DGepyM2e',
          },
        },
      },
      {
        quoted: message,
      },
    );
  }

  getPing(messageTimestamp: number) {
    const rtf = new Intl.RelativeTimeFormat('id-ID', { numeric: 'auto' });

    let timestamp = messageTimestamp.toString().padEnd(13, '0');
    const ping = Date.now() - (+timestamp || Date.now());
    return `Pong! ${rtf.format(+ping / 1_000, 'seconds')}${ReadMoreUnicode}`;
  }

  async getServerInformation() {
    const serverInfo: {
      hostname: string;
      uptime: string;
      os: {
        platform: string;
        type: string;
        release: string;
        arch: string;
      };
      cpu: {
        model: string;
        speed: number;
        cores: number;
      };
      memory: {
        total: number;
        free: number;
        used: number;
      };
      disk: {
        fs: string;
        size: string;
        used: string;
        available: string;
        capacity: string;
        mount: string;
      }[];
    } = {
      hostname: '',
      uptime: '',
      os: {
        platform: '',
        type: '',
        release: '',
        arch: '',
      },
      cpu: {
        model: '',
        speed: 0,
        cores: 0,
      },
      memory: {
        total: 0,
        free: 0,
        used: 0,
      },
      disk: [],
    };

    // Hostname
    serverInfo.hostname = os.hostname();

    // Uptime
    const uptime = os.uptime();
    serverInfo.uptime = `${Math.floor(uptime / 3600)} hours, ${Math.floor(
      (uptime % 3600) / 60,
    )} minutes`;

    // OS Information
    serverInfo.os = {
      platform: os.platform(),
      type: os.type(),
      release: os.release(),
      arch: os.arch(),
    };

    // CPU Information
    serverInfo.cpu = {
      model: os.cpus()[0].model,
      speed: os.cpus()[0].speed,
      cores: os.cpus().length,
    };

    // Memory Information
    serverInfo.memory = {
      total: os.totalmem(),
      free: os.freemem(),
      used: os.totalmem() - os.freemem(),
    };

    // Disk Information
    const execPromise = util.promisify(exec);
    const diskSpace = await execPromise('df -h');

    const diskLines = diskSpace.stdout
      .split('\n')
      .filter((line) => line.startsWith('/'));
    serverInfo.disk = diskLines.map((line) => {
      const [fs, size, used, available, capacity, mount] = line.split(/\s+/);
      return {
        fs,
        size,
        used,
        available,
        capacity,
        mount,
      };
    });

    return serverInfo;
  }

  bytesToGB(bytes: number) {
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  }
}
