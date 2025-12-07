import '@pynickle/koishi-plugin-adapter-onebot';
import petPetGif from '@someaspy/pet-pet-gif';
import { Schema, Context, Session, h } from 'koishi';

export const name = 'pet-pet-gif';

export interface Config {
    resolution?: number;
    delay?: number;
    backgroundColor?: string;
}

export const Config: Schema<Config> = Schema.object({
    resolution: Schema.number().default(128).description('生成 GIF 的分辨率'),
    delay: Schema.number().default(20).description('每帧延迟（毫秒）'),
    backgroundColor: Schema.string().default('transparent').description('背景颜色'),
});

export function apply(ctx: Context, cfg: Config) {
    ctx.i18n.define('zh-CN', require('./locales/zh-CN.json'));

    ctx.command('petgif').action(async ({ session }) => await petgif(ctx, session, cfg));
}

export async function petgif(ctx: Context, session: Session, cfg: Config) {
    // 简单的实现：从命令参数中提取 URL
    const content = session.quote.elements;

    if (!content) {
        return session.text('.noImageProvided');
    }

    if (content[0].type !== 'img') {
        return session.text('.noImageProvided');
    }

    const imageUrl = content[0].attrs.src;

    try {
        // 生成 GIF
        const gifBuffer = await petPetGif(imageUrl, {
            resolution: cfg.resolution,
            delay: cfg.delay,
            backgroundColor: cfg.backgroundColor,
        });

        await session.send(h.image(gifBuffer, 'image/png'));
    } catch (error) {
        ctx.logger.error('Error generating pet-pet GIF:', error);
        return session.text('.generationError');
    }
}
