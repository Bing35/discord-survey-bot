# Discord survey bot
This bot does surveys by asking questions to people using the question.json file.

To start the survey, you need to type `$survey` in a channel where the bot is in. Then, the bot will start a DM with you. It will start an interactive survey where it asks you questions and you answer them. At the end of the survey, it will send you a summary of your answers. It doesn't do anything else with the answers, but it can potentially do something else.

## How to run

### Setup your environment variables

The application needs a discord bot token to run. Put it in the `DISCORD_TOKEN` environment variable.

`export DISCORD_TOKEN='SOMETOKEN'`

### Run the bot

`node app.mjs`
