const NeutralinoMethods = {
    start: () => {
        document
            .getElementById('info')
            .innerHTML = window.NL_NAME + " is running on port " +
            window.NL_PORT + " inside " + window.NL_OS + "<br/><br/>" +
            "<span>v" + window.NL_VERSION + "</span>";
    },

    help: () => new Promise((res, rej) => {
        try {
            window.Neutralino.os.runCommand(
                'help',
                (data) => {
                    message = data;
                    res(data);
                },
                () => {
                    rej('error');
                    console.log('errror');
                }
            );
        } catch (error) {
            console.log(error.message);
            message = error.message;
            rej(error.message);
        }
    })
};

const check = setInterval(() => {
    if (window.Neutralino) {
        clearInterval(check);
        window.Neutralino.init({
            load: function () {
                NeutralinoMethods.start();
            },
            pingSuccessCallback: function () {

            },
            pingFailCallback: function () {

            }
        });
    }
}, 500);

export default {
    help: NeutralinoMethods.help
}