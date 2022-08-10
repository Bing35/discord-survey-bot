import {Client, Intents} from 'discord.js'
import fs from 'fs/promises'

// can manage messages and add reactions
const client = new Client({intents: ['GUILDS', 'GUILD_MESSAGES', Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.DIRECT_MESSAGES]})

// the bot token is taken from an environment variable
client.login(process.env['DISCORD_TOKEN'])

// take json
const questionJson = await fs.readFile('questions.json', {encoding: 'utf-8'}).then(str=>JSON.parse(str))

client.on('ready', function(){
    console.log(`${client.user.tag} is running`);
})

client.on('messageCreate', async function(message){
    if(message.author.bot){
        return
    }

    if(message.content[0] === '$'){
        await commands(message)
    }

})


// ****************************
// functions

const commands = async function(message){
	if(message.content.slice(1) === 'survey'){
        const dmChannel = await message.author.createDM()
            .then(dmChannel=>dmChannel)
            .catch(e=>message.channel.send(e))
        
        await dmChannel.send('start survey')
       
	   	const surveyNames = questionJson.map((surveyObj,index)=>`${index} - ${surveyObj.surveyName}`)
		await dmChannel.send('enter the survey number for the survey that you want to answer\n' + `\`${surveyNames.join('\n')}\``)
		const surveyNumber = Number(await createWaitDMFunction(dmChannel))
		
		if(typeof(surveyNumber) != 'number'){
			await dmChannel.send('answer is not a number. aborting survey.')
			return
		}

		//start survey questions
		const answerArray = []
		await dmChannel.send(questionJson[surveyNumber].surveyName)
		const questions = questionJson[surveyNumber].questions
		let questionIndex = 0
		while (questionIndex < questions.length) {
			const questionObject = questions[questionIndex]
			await dmChannel.send(questionObject.question)
			if(questionObject.suggestions){
				await dmChannel.send('Answer with one of the answers below')
				await dmChannel.send('`' + questionObject.suggestions.join('\n') + '`')

				if(questionObject.other){
					await dmChannel.send('You can submit an answer that is not part of the suggestions')
				}
				else{
					await dmChannel.send('You can only submit an answer that is part of the suggestions')
				}
			}

			const answer = await createWaitDMFunction(dmChannel)
			if (answer == false){
				dmChannel.send('you didn\'t answer. the bot will close this sign up.')
				return
			}

			//verify if the answer is within the suggestions
			if(questionObject.suggestions && !questionObject.other){
				let isASuggestion = false
				for(const suggestion of questionObject.suggestions){
					if(answer === suggestion){isASuggestion=true;break;}
				}
				if(isASuggestion){
					answerArray.push({
						question: questionObject.question,
						answer: answer
					})
					questionIndex += 1
				}
				else{
					dmChannel.send('The answer is not one of the suggestions. You need to give it as one of them.')
				}
				continue
			}

			answerArray.push({
				question: questionObject.question,
				answer: answer 
			})
			questionIndex += 1
		}
		
		let answerStr = ''
		for(const answerObject of answerArray){
			answerStr += `\`${answerObject.question}\`: \`${answerObject.answer}\`\n`
		}
		await dmChannel.send('your answers are:\n' + answerStr)
    	}
}


async function createWaitDMFunction(dmChannel){
    let nCalls = 0

    async function recCollect(){
        nCalls++
        const messages = await dmChannel.awaitMessages({
            filter: message=>true,
            time: 1000,
        }).then(obj=>obj)

        if(nCalls > 60){return false}
        else if(messages.first() && !messages.first().author.bot){return messages.first().content}

        return await recCollect()
	}

	return await recCollect()
}
