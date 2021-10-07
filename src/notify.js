const notifier = require('node-notifier');

const notifyWithoutCallback = async (title = 'Monitoring Notification', message = 'empty', sound = true) => {
    await notifier.notify({
        title: title,
        message: message,
        sound: sound
    })
}

module.exports = {
    notifyWithoutCallback
}