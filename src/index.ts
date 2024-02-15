import { Env, Event } from "./types";

async function sendPushNotification(event: Event, token: string) {
	const API_ENDPOINT = 'https://api.pushbullet.com/v2/pushes';

	const response = await fetch(API_ENDPOINT, {
		method: 'post',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`
		},
		body: JSON.stringify({
			type: 'note',
			title: `${event.name}'s ${event.type}`,
			body: `Wish ${event.name} for ${event.type}`
		}),
	});

	if (response.ok) {
		console.log(`Notification sent for ${event.name}'s ${event.type}`);
	} else {
		const errorResponse = await response.json();
		const formattedErrorResponse = JSON.stringify(errorResponse, null, 2);
		console.error(`Failed to send notification for ${event.name}'s ${event.type}.\nResponse: ${formattedErrorResponse}`);
	}
}

export default {
	async fetch(_request: Request, _env: Env, _ctx: ExecutionContext): Promise<Response> {
		return new Response('Why are you here?');
	},

	async scheduled(_event: ScheduledEvent, env: Env, _ctx: ExecutionContext): Promise<void> {
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
			await sendPushNotification(event, env.PUSHBULLET_TOKEN);
		}
	},
};
