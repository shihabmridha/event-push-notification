import { post } from "./fetch";
import { Event } from "./types";

async function sendToPushBullet(event: Event, token: string) {
	const PUSHBULLET_ENDPOINT = 'https://api.pushbullet.com/v2/pushes';
	const payload = JSON.stringify({
		type: 'note',
		title: `${event.name}'s ${event.type}`,
		body: `Wish ${event.name} for ${event.type}`
	});

	await post(PUSHBULLET_ENDPOINT, payload, token);
}

async function sendToNtfy(event: Event, endpoint: string, token: string) {
	await post(endpoint, `Wish ${event.name} for ${event.type}`, token);
}

export default {
	async fetch(request: Request, env: CloudflareBindings, _ctx: ExecutionContext): Promise<Response> {
		const NTFY_ENDPOINT = env.NTFY_HOST;

		const fakeEvent: Event = {
			name: 'Test event ' + Math.random(),
			type: 'Birthday',
			day: 1,
			month: 1,
		};

		const url = new URL(request.url);
		const token = url.searchParams.get('token');

		if (token === env.TEST_TOKEN) {
			await Promise.allSettled([
				sendToPushBullet(fakeEvent, env.PUSHBULLET_TOKEN),
				sendToNtfy(fakeEvent, NTFY_ENDPOINT, env.NTFY_TOKEN),
			]);
		}

		return new Response('Why are you here?');
	},

	async scheduled(_event: ScheduledEvent, env: CloudflareBindings, _ctx: ExecutionContext): Promise<void> {
		const NTFY_ENDPOINT = env.NTFY_HOST;

		const { results } = await env.DB.prepare("SELECT * FROM personal_events").all<Event>();

		const todayEvents = results.filter((event) => {
			const today = new Date();
			today.setHours(today.getHours() + 6); // UTC to Bangladesh Standard Time (UTC+6)

			const currentHour = today.getHours();
			const currentDate = today.getDate();
			const currentMonth = today.getMonth() + 1;

			const isMidnight = currentHour === 0;
			const isSameDate = currentDate === event.day;
			const isSameMonth = currentMonth === event.month;

			console.log(today, isSameMonth, isSameDate);
			console.log(`${today}, SameMonth = ${isSameMonth} (${event.month}-${currentMonth}), SameDay = ${isSameDate} (${event.day}-${currentDate})`);

			return isSameDate && isSameMonth && isMidnight;
		});

		console.log(`${todayEvents.length} events found today`);

		for (const event of todayEvents) {
			await Promise.allSettled([
				sendToPushBullet(event, env.PUSHBULLET_TOKEN),
				sendToNtfy(event, NTFY_ENDPOINT, env.NTFY_TOKEN),
			]);
		}
	},
};
