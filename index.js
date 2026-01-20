const { Telegraf, Scenes, session, Markup } = require('telegraf');

// Токен бота из переменной окружения
const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) {
    throw new Error('Please set BOT_TOKEN in environment variables');
}

const bot = new Telegraf(BOT_TOKEN);

// ---------- СЦЕНАРИЙ КВЕСТА ----------
const questScene = new Scenes.WizardScene(
    'quest',

    // ШАГ 1. Подтверждение личности
    async (ctx) => {
        await ctx.reply(
            'Привет.\nПодтверди, пожалуйста:\nТы Валерия и у тебя сегодня день рождения?',
            Markup.inlineKeyboard([
                [Markup.button.callback('Да, это я', 'confirm_yes')],
                [Markup.button.callback('Кажется, вы ошиблись', 'confirm_no')]
            ])
        );
        return ctx.wizard.next();
    },

    // ШАГ 1. Обработка подтверждения личности
    async (ctx) => {
        if (!ctx.callbackQuery) return;
        await ctx.answerCbQuery();
        if (ctx.callbackQuery.message) {
            try { await ctx.editMessageReplyMarkup({ inline_keyboard: [] }); } catch { }
        }

        const answer = ctx.callbackQuery.data;

        if (answer === 'confirm_yes') {
            await ctx.reply('Отлично. Тогда начнём маленький квест.');

            await ctx.reply(
                'Кто твоя самая любимая собака?',
                Markup.inlineKeyboard([
                    [Markup.button.callback('Дыня', 'dog_dinya')],
                    [Markup.button.callback('Нори', 'dog_nori')]
                ])
            );

            return ctx.wizard.next();

        } else {
            await ctx.reply(
                'Хм… кажется, без тебя этот квест не имеет смысла.\n' +
                'Попробуй ещё раз подтвердить, пожалуйста.',
                Markup.inlineKeyboard([
                    [Markup.button.callback('Да, это я', 'confirm_yes')],
                    [Markup.button.callback('Кажется, вы ошиблись', 'confirm_no')]
                ])
            );

            return; // остаёмся на этом шаге
        }
    },

    // ШАГ 2. Обработка выбора собаки
    async (ctx) => {
        if (!ctx.callbackQuery) return;
        await ctx.answerCbQuery();
        if (ctx.callbackQuery.message) {
            try { await ctx.editMessageReplyMarkup({ inline_keyboard: [] }); } catch { }
        }

        const dog = ctx.callbackQuery.data;

        if (dog === 'dog_dinya') {
            await ctx.replyWithPhoto(
                { url: 'https://raw.githubusercontent.com/Grainycurd/photobank/main/img/melon1.png' },
                {
                    caption: 'Конечно. Дыня — это отдельная любовь.\n\nА какая у неё самая любимая игрушка?',
                    ...Markup.inlineKeyboard([
                        [Markup.button.callback('Зелёная палка', 'toy_stick')],
                        [Markup.button.callback('Синее колечко', 'toy_ring')],
                        [Markup.button.callback('Розовый мячик', 'toy_ball')]
                    ])
                }
            );
        } else {
            await ctx.replyWithPhoto(
                { url: 'https://raw.githubusercontent.com/Grainycurd/photobank/main/img/nori1.png' },
                {
                    caption: 'Нори. Тут без вариантов.\n\nА чего Нори боится больше всего?',
                    ...Markup.inlineKeyboard([
                        [Markup.button.callback('Пакета', 'fear_bag')],
                        [Markup.button.callback('Людей', 'fear_people')],
                        [Markup.button.callback('Листика', 'fear_leaf')]
                    ])
                }
            );
        }

        return ctx.wizard.next();
    },

    // ШАГ 3. После ответа на игрушку или страх
    async (ctx) => {
        if (!ctx.callbackQuery) return;
        await ctx.answerCbQuery();
        if (ctx.callbackQuery.message) {
            try { await ctx.editMessageReplyMarkup({ inline_keyboard: [] }); } catch { }
        }

        await ctx.reply('пусть будет так)');

        await ctx.reply(
            'А теперь вопрос посложнее.\nКакое сообщение ты написала мне самым первым?',
            Markup.inlineKeyboard([
                [Markup.button.callback('Привет, ты к 11 приедешь ?)', 'first_1')],
                [Markup.button.callback('Ты случайно не тот самый…', 'first_2')],
                [Markup.button.callback('Антон, дай свой номер', 'first_3')],
                [Markup.button.callback('Привет, хочешь взять персоналку вт, чт в 14.30?)', 'first_4')]
            ])
        );

        return ctx.wizard.next();
    },

    // ШАГ 4. Проверка первого сообщения
    async (ctx) => {
        if (!ctx.callbackQuery) return;
        await ctx.answerCbQuery();
        if (ctx.callbackQuery.message) {
            try { await ctx.editMessageReplyMarkup({ inline_keyboard: [] }); } catch { }
        }

        const firstMsg = ctx.callbackQuery.data;
        const CORRECT = 'first_1';

        if (firstMsg === CORRECT) {
            await ctx.reply('Именно так. С этого всё и началось.');

            await ctx.reply(
                'А теперь самое главное\n' +
                'Твой подарок лежит:\n\n' +
                '📍 за Дыней\n\n' +
                'С днём рождения ❤️'
            );

            return ctx.scene.leave();

        } else {
            await ctx.reply('Это было близко… но давай попробуем ещё раз.');

            await ctx.reply(
                'Какое сообщение ты написала мне самым первым?',
                Markup.inlineKeyboard([
                    [Markup.button.callback('Привет, ты к 11 приедешь ?)', 'first_1')],
                    [Markup.button.callback('Ты случайно не тот самый…', 'first_2')],
                    [Markup.button.callback('Антон, дай свой номер', 'first_3')],
                    [Markup.button.callback('Привет, хочешь взять персоналку вт, чт в 14.30?)', 'first_4')]
                ])
            );

            return; // остаёмся на этом шаге до правильного ответа
        }
    }
);

// ---------- РЕГИСТРАЦИЯ СЦЕН ----------
const stage = new Scenes.Stage([questScene]);
bot.use(session());
bot.use(stage.middleware());

// ---------- /start ----------
bot.start((ctx) => ctx.scene.enter('quest'));

// ---------- ЗАПУСК ----------
bot.launch();
console.log('Bot started');

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));