import dayjs from 'dayjs';

export interface Env {
	DB: D1Database;
	PUSHBULLET_TOKEN: string;
}

export interface Event {
	name: string;
	type: string;
	day: number;
	month: number;
}

export default {
	async fetch(_request: Request, _env: Env, _ctx: ExecutionContext): Promise<Response> {
		return new Response('Why are you here?');
	},

	async scheduled(event: ScheduledEvent, env: Env, _ctx: ExecutionContext): Promise<void> {
		const { results } = await env.DB.prepare("SELECT * FROM personal_events").all<Event>();

		const todayEvents = results.filter((i) => {
			const today = dayjs().add(6, 'h'); // UTC to UTC+6

			// isSame() does not work without same year
			const dob = dayjs().set("month", i.month - 1).set("date", i.day);

			const isSameMonth = dob.isSame(today, "month");
			const isSameDay = dob.isSame(today, "day");

			console.log(today.toDate(), isSameMonth, isSameDay);

			return isSameDay && isSameMonth;
		});

		for (const event of todayEvents) {
			await fetch('https://api.pushbullet.com/v2/pushes', {
				method: 'post',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${env.PUSHBULLET_TOKEN}`
				},
				body: JSON.stringify({
					type: 'note',
					title: `${event.name}'s ${event.type}`,
					body: `Wish ${event.name} for ${event.type}`
				}),
			});
		}

		console.log(`${todayEvents.length} events found today`);
	},
};
