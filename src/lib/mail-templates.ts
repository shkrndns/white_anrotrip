function nowRu(): string {
	return new Date().toLocaleString('ru-RU', {
		timeZone: 'Asia/Yekaterinburg',
		day: 'numeric',
		month: 'long',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	});
}

function escHtml(str: string): string {
	return str
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/\n/g, '<br>');
}

function escTelegram(str: string): string {
	return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Брендированное HTML-письмо ANRO TRIP. */
export function wrapHtml(
	formType: string,
	icon: string,
	rows: [string, string, boolean?][],
): string {
	const rowsHtml = rows
		.map(([label, value, highlight], i) => {
			const bg = i % 2 === 0 ? '#f9fafb' : '#ffffff';
			const valStyle = highlight
				? 'font-size:16px;font-weight:800;color:#00abb3;letter-spacing:0.3px;white-space:nowrap'
				: 'font-size:14px;font-weight:600;color:#111827;white-space:pre-wrap;word-break:break-word';
			const border =
				i < rows.length - 1 ? 'border-bottom:1px solid #e5e7eb' : '';
			return `
        <tr style="background:${bg}">
          <td style="padding:12px 16px;color:#6b7280;font-size:13px;width:100px;${border};vertical-align:top">${escHtml(label)}</td>
          <td style="padding:12px 16px;${valStyle};${border}">${escHtml(value)}</td>
        </tr>`;
		})
		.join('');

	return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escHtml(formType)} — ANRO TRIP</title>
</head>
<body style="margin:0;padding:0;background:#f0f9f9;font-family:-apple-system,Arial,Helvetica,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f9f9">
  <tr><td align="center" style="padding:32px 12px">

    <table width="560" cellpadding="0" cellspacing="0"
           style="max-width:560px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;
                  box-shadow:0 4px 24px rgba(0,171,179,.13)">

      <tr>
        <td style="background:linear-gradient(135deg,#00abb3 0%,#008a91 100%);padding:26px 32px">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td>
                <div style="color:#ffffff;font-size:22px;font-weight:800;letter-spacing:-0.5px;line-height:1.1">ANRO TRIP</div>
                <div style="color:rgba(207,247,248,.8);font-size:10.5px;margin-top:5px;letter-spacing:1.8px">ТУРИСТИЧЕСКОЕ АГЕНТСТВО</div>
              </td>
              <td align="right" style="vertical-align:top">
                <div style="color:rgba(255,255,255,.45);font-size:11px">anrotrip.ru</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <tr>
        <td style="padding:24px 32px 8px">
          <div style="display:inline-block;background:#e6f7f8;border:1.5px solid #00abb3;border-radius:10px;padding:10px 20px">
            <span style="font-size:15px;font-weight:700;color:#006d73">${escHtml(icon)}&nbsp;&nbsp;${escHtml(formType)}</span>
          </div>
          <div style="margin-top:10px;color:#9ca3af;font-size:12px">Новая заявка с сайта anrotrip.ru</div>
        </td>
      </tr>

      <tr>
        <td style="padding:0 32px">
          <table width="100%" cellpadding="0" cellspacing="0"
                 style="border-radius:10px;overflow:hidden;border:1px solid #e5e7eb">
            ${rowsHtml}
          </table>
        </td>
      </tr>

      <tr>
        <td style="padding:16px 32px 4px">
          <div style="color:#9ca3af;font-size:12px">🕐&nbsp;${nowRu()} (Екб)</div>
        </td>
      </tr>

      <tr>
        <td style="padding:12px 32px 24px;border-top:1px solid #f3f4f6">
          <div style="color:#d1d5db;font-size:11px;margin-top:12px">
            Автоматическое уведомление · anrotrip.ru
          </div>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;
}

const LINE = '──────────────────────';

/** Формирует Telegram-сообщение (parse_mode: HTML). */
export function buildTelegram(
	icon: string,
	formType: string,
	fields: [string, string][],
	extra?: string,
): string {
	const fieldsText = fields
		.map(
			([label, value]) => `${escTelegram(label)}: <b>${escTelegram(value)}</b>`,
		)
		.join('\n');

	const parts = [
		`${icon} <b>${escTelegram(formType.toUpperCase())}</b>`,
		`<i>anrotrip.ru</i>`,
		LINE,
		fieldsText,
		...(extra ? [LINE, escTelegram(extra)] : []),
		LINE,
		`🕐 ${nowRu()} (Екб)`,
	];

	return parts.join('\n');
}
