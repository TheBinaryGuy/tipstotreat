import { env } from 'cloudflare:workers';

type Mail = { to: string; subject: string; text: string; html?: string };

/**
 * Sends through Cloudflare Email Service when the binding exists (production); in local dev the
 * message is printed to the terminal so links can be copied from there.
 */
export async function sendEmail(mail: Mail) {
    const binding = (env as { EMAIL?: SendEmail }).EMAIL;
    const from = env.EMAIL_FROM || 'TipsToTreat <no-reply@tipstotreat.com>';
    if (!binding || import.meta.env.DEV) {
        console.log(`\n[email → ${mail.to}] ${mail.subject}\n${mail.text}\n`);
        if (!binding) return { sent: false as const };
        if (import.meta.env.DEV) return { sent: false as const };
    }
    await binding.send({
        from,
        to: mail.to,
        subject: mail.subject,
        text: mail.text,
        html: mail.html,
    });
    return { sent: true as const };
}

export function resetPasswordEmail(name: string, url: string) {
    const text = `Hello ${name},\n\nSomeone asked to reset the password for your TipsToTreat account. If that was you, open this link (it works for one hour):\n\n${url}\n\nIf it was not you, ignore this email; nothing changes.\n\nTipsToTreat`;
    const html = `<p>Hello ${escapeHtml(name)},</p><p>Someone asked to reset the password for your TipsToTreat account. If that was you, open this link (it works for one hour):</p><p><a href="${url}">${url}</a></p><p>If it was not you, ignore this email; nothing changes.</p><p>TipsToTreat</p>`;
    return { text, html };
}

function escapeHtml(value: string) {
    return value.replace(
        /[&<>"]/g,
        c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] ?? c
    );
}
