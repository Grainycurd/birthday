const { Telegraf, Scenes, session, Markup } = require('telegraf');

const BOT_TOKEN = '7963356079:AAGYTgrVUQnEMRTaPFizio_pYSo4AndhrPg';


const bot = new Telegraf(BOT_TOKEN);

// ---------- СЦЕНАРИЙ КВЕСТА ----------

const questScene = new Scenes.WizardScene(
    'quest',

    // ШАГ 1. Отправляем первый вопрос (на /start)
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

        const answer = ctx.callbackQuery.data;

        if (answer === 'confirm_yes') {
            ctx.scene.session.confirm = true;

            await ctx.editMessageText('Отлично. Тогда начнём маленький квест.');

            // ШАГ 2. Выбор собаки
            await ctx.reply(
                'Кто твоя самая любимая собака?',
                Markup.inlineKeyboard([
                    [Markup.button.callback('Дыня', 'dog_dinya')],
                    [Markup.button.callback('Нори', 'dog_nori')]
                ])
            );

            return ctx.wizard.next();

        } else {
            // Неправильный ответ → повторяем вопрос
            await ctx.editMessageText(
                'Хм… кажется, без тебя этот квест не имеет смысла.'
            );

            await ctx.reply(
                'Подтверди, пожалуйста:\nТы Валерия и у тебя сегодня день рождения?',
                Markup.inlineKeyboard([
                    [Markup.button.callback('Да, это я', 'confirm_yes')],
                    [Markup.button.callback('Кажется, вы ошиблись', 'confirm_no')]
                ])
            );

            // Остаёмся на этом же шаге
            return;
        }
    },

    // ШАГ 2. Обработка выбора собаки
    async (ctx) => {
        if (!ctx.callbackQuery) return;

        const dog = ctx.callbackQuery.data;
        ctx.scene.session.dog = dog;

        if (dog === 'dog_dinya') {
            await ctx.editMessageText('Конечно. Дыня — это отдельная любовь.');

            // ВЕТКА ДЫНЯ
            await ctx.reply(
                'А какая у неё самая любимая игрушка?',
                Markup.inlineKeyboard([
                    [Markup.button.callback('Зелёная палка', 'toy_stick')],
                    [Markup.button.callback('Синее колечко', 'toy_ring')],
                    [Markup.button.callback('Розовый мячик', 'toy_ball')]
                ])
            );
        } else {
            await ctx.editMessageText('Нори. Тут без вариантов.');

            // ВЕТКА НОРИ
            await ctx.reply(
                'А чего Нори боится больше всего?',
                Markup.inlineKeyboard([
                    [Markup.button.callback('Пакета', 'fear_bag')],
                    [Markup.button.callback('Людей', 'fear_people')],
                    [Markup.button.callback('Листика', 'fear_leaf')]
                ])
            );
        }

        return ctx.wizard.next();
    },

    // ШАГ 3. Обработка ветки Дыня / Нори
    async (ctx) => {
        if (!ctx.callbackQuery) return;

        ctx.scene.session.secondAnswer = ctx.callbackQuery.data;

        await ctx.editMessageText(
            'Ты удивительно хорошо помнишь такие мелочи.'
        );

        // ШАГ 4. Первый месседж
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

    // ШАГ 4. Обработка первого сообщения (с повтором при ошибке)
    async (ctx) => {
        if (!ctx.callbackQuery) return;

        const firstMsg = ctx.callbackQuery.data;

        // ПРАВИЛЬНЫЙ ОТВЕТ
        const CORRECT = 'first_1';

        if (firstMsg === CORRECT) {
            // Правильный вариант
            await ctx.editMessageText(
                'Именно так. С этого всё и началось.'
            );

            // ШАГ 5. Подарок
            await ctx.reply(
                'А теперь самое главное.\n' +
                'След квест\n\n' +
                '📍 Под вентилятором.\n\n' +
                'На этом я ботАнтон с тобой прощается и С днём рождения, Валерия.'
            );

            return ctx.scene.leave();

        } else {
            // Неправильный вариант → повторяем вопрос
            await ctx.editMessageText(
                'Это было близко… но давай попробуем ещё раз.'
            );

            await ctx.reply(
                'Какое сообщение ты написала мне самым первым?',
                Markup.inlineKeyboard([
                    [Markup.button.callback('Привет, ты к 11 приедешь ?)', 'first_1')],
                    [Markup.button.callback('Ты случайно не тот самый…', 'first_2')],
                    [Markup.button.callback('Антон, дай свой номер', 'first_3')],
                    [Markup.button.callback('Привет, хочешь взять персоналку вт, чт в 14.30?)', 'first_4')]
                ])
            );

            // Остаёмся на этом же шаге
            return;
        }
    }
);

// ---------- РЕГИСТРАЦИЯ СЦЕН ----------

const stage = new Scenes.Stage([questScene]);

bot.use(session());
bot.use(stage.middleware());

// ---------- КОМАНДА /start ----------

bot.start((ctx) => {
    ctx.scene.enter('quest');
});

// ---------- ЗАПУСК БОТА ----------

bot.launch();

console.log('Bot started');

// Корректное завершение
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));