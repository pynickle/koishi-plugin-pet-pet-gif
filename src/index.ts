import axios from 'axios';
import { Schema, Context, Session, h } from 'koishi';

export const name = 'pet-pet-gif';

export interface Config {
    apiUrl?: string;
}

export const Config: Schema<Config> = Schema.object({
    apiUrl: Schema.string()
        .default('https://api.popcat.xyz/v2/pet')
        .description('生成 pet-pet GIF 的 API 地址'),
});

export function apply(ctx: Context, cfg: Config) {
    ctx.i18n.define('zh-CN', require('./locales/zh-CN.json'));

    ctx.command('petgif').action(async ({ session }) => await petgif(ctx, session, cfg));
}

export async function petgif(ctx: Context, session: Session, cfg: Config) {
    let imageUrl: string;

    const findImage = (elements: any[]) => elements?.find((c) => c.type === 'img')?.attrs?.src;

    const imageInQuote = session.quote ? findImage(session.quote.elements) : null;
    const imageInMsg = findImage(session.elements);

    imageUrl = imageInQuote ?? imageInMsg;

    if (!imageUrl) {
        return session.text('.noImageFound');
    }

    try {
        const response = await axios.get(cfg.apiUrl, {
            params: {
                image: imageUrl,
            },
            responseType: 'arraybuffer',
        });

        const gifBuffer = Buffer.from(response.data);
        await session.send(h.image(gifBuffer, 'image/gif'));
    } catch (error) {
        ctx.logger.error('Error generating pet-pet GIF:', error);
        return session.text('.generationError');
    }
}
