import { prisma } from './prisma';
import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import dayjs from 'dayjs';

export async function appRoutes(app: FastifyInstance) {
  
  app.post('/habits', async (request) => {
    const createHabitBody = z.object({
      title: z.string(),
      weekDays: z.array(z.number().min(0).max(6))
    });

    const { title, weekDays } = createHabitBody.parse(request.body);
    const today = dayjs().startOf('day').toDate();

    await prisma.habit.create({
      data: {
        title,
        created_at: today,
        weekDays: {
          create: weekDays.map(weekDay => {
            return {
              week_day: weekDay
            }
          })
        }
      }
    });
  });

  app.get('/habits', async () => {
    const habits = await prisma.habit.findMany();

    return habits;
  });

  app.get('/days', async () => {
    const days = await prisma.day.findMany();

    return days;
  });

  app.get('/day', async (request) => {
    const getDayParams = z.object({
      date: z.coerce.date()
    });

    const { date } = getDayParams.parse(request.query);
    const parsedDate = dayjs(date).startOf('day');
    const weekDay = parsedDate.get('day');

    const possibleHabits = await prisma.habit.findMany({
      where: {
        created_at: {
          lte: date
        },
        weekDays: {
          some: {
            week_day: weekDay
          }
        }
      }
    });

    const day = await prisma.day.findUnique({
      where: {
        date: parsedDate.toDate()
      }, 
      include: {
        dayHabits: true
      }
    });

    const completedHabits = day?.dayHabits.map(dayHabit => {
      return dayHabit.habit_id
    }) ?? []; 

    return {
      possibleHabits,
      completedHabits
    };
  });

  /**
   * Patch: atualizar uma informação específica de um recurso
   * Nesse caso, mudar somente o status do hábito
   */
  app.patch('/habits/:id/toggle', async (request) => {
    const toggleHabitParams = z.object({
      id: z.string().uuid(),
    });

    const { id } = toggleHabitParams.parse(request.params);
    const today = dayjs().startOf('day').toDate();

    let day = await prisma.day.findUnique({
      where: {
        date: today
      }
    });

    if (!day) {
      day = await prisma.day.create({
        data: {
          date: today
        }
      })
    }

    // Ja marcou completo?
    const dayHabit = await prisma.dayHabit.findUnique({
      where: {
        day_id_habit_id: {
          day_id: day.id,
          habit_id: id
        }
      }
    });

    if (dayHabit) {
      await prisma.dayHabit.delete({
        where: {
          id: dayHabit.id
        }
      });
    } else {
      // Completar o hábito
      await prisma.dayHabit.create({
        data: {
          day_id: day.id,
          habit_id: id
        }
      });
    }

  });

  /**
   * Retornar um resumo com uma lista de informações com:
   *  -> data
   *  -> quant habitos possiveis
   *  -> quant habitos completados
   */
  app.get('/summary', async () => {
    const summary = await prisma.$queryRaw`
      SELECT 
        d.id, 
        d.date,
        (
          SELECT 
            cast(count(*) as float) 
          FROM day_habits dh
          WHERE dh.day_id = d.id
        ) AS completed,
        (
          SELECT
            cast(count(*) as float)
          FROM habit_week_days HWD
          JOIN habits H
            ON H.id = HWD.habit_id
          WHERE 
            HWD.week_day = cast(strftime('%w', d.date/1000.0, 'unixepoch') as int)
            AND H.created_at <= d.date
        ) as amount
      FROM days d
    `

    return summary;
  });
}
