/**
 *
 */
export const exec = () =>
  new Promise((res, rej) => {
    try {
      Neutralino.os.runCommand(
        'help',
        (data) => {
          res(data);
        },
        () => {
          rej('error');
        }
      );
    } catch (error) {
      rej(error.message);
    }
  });
