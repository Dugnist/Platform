export default {
  start: () => {
    // const infoTag = document.getElementById('info');

    // if (infoTag) {
    document.getElementById('info').innerHTML =
      window.NL_NAME +
      ' is running on port ' +
      window.NL_PORT +
      ' inside ' +
      window.NL_OS +
      '<br/><br/>' +
      '<span>v' +
      window.NL_VERSION +
      '</span>';
    // }
  },

  help: (command) =>
    new Promise((res, rej) => {
      try {
        window.Neutralino.os.runCommand(
          command,
          (data) => res(data),
          (error) => rej(error)
        );
      } catch (error) {
        rej(error.message);
      }
    }),
};
