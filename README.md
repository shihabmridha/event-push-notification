Send push notification via PushBullet for Birthday, Anniversary etc.

Table schema:
```
id INT,
name TEXT,
type TEXT,
day INT,
month INT
```

### Test locally
```
bun dev --remote --test-scheduled
```
`--remote` - To access D1 database
`--test-scheduled` - To execute the scheduled function locally

Hit the following endpoint to execute the function
```
http://localhost:3000/__scheduled?cron=0+*/1+*+*+*

```
Or, set `TEST_TOKEN` in wranger.toml and call the following url
```
http://localhost:3000/?token=<TEST_TOKEN>
```
