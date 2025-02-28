export async function post(url: string, payload: string, token: string) {
	const response = await fetch(url, {
		method: 'post',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
		body: payload,
	});

	if (response.ok) {
		console.log(`Notification sent!`);
	} else {
		const errorResponse = await response.json();
		const formattedErrorResponse = JSON.stringify(errorResponse, null, 2);
		console.error(`Failed to send notification.\nResponse: ${formattedErrorResponse}`);
	}

	const data = await response.json();
	return data;
}
