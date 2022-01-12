const { readdirSync: readFolder } = require('fs')
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const config = require('../config.json')

const fetchCommands = () => readFolder('./commands').filter(file => file.endsWith('.js'))

const InitCommandListener = async client => {
    client.on('interactionCreate', async interaction => {
        if (!interaction.isCommand()) return;
        const { commandName } = interaction

        const _command = client.commands.get(commandName)
        if (!_command)
            return
        _command.execute(interaction)
    })
}

const InitCommands = async client => {
    console.log("Loading commands...")
    try {
        const commandList = fetchCommands()
        commandList.forEach(file => {
            const command = require(`../commands/${file}`)
            client.commandList.push(command.data.toJSON())
            client.commands.set(command.data.name, command)
        })
    } catch (e) {
        console.log("There was an error loading the commands.", e)
    }

    const rest = new REST({ version: '9' }).setToken(config.Token);
    try {
        await rest.put(
            Routes.applicationGuildCommands(client.user.id, config.GuildID),
            { body: client.commandList },
        );
        console.log('Commands Loaded!');
    } catch (error) {
        console.error(error);
    }
    InitCommandListener(client)
}

module.exports = InitCommands