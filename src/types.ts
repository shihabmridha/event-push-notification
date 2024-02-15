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
